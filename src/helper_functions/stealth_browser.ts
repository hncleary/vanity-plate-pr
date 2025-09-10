import { BrowserContext, Page } from 'playwright';

/**
 * Creates a stealth page with additional anti-detection measures
 */
export async function createStealthPage(context: BrowserContext): Promise<Page> {
    const page = await context.newPage();

    // Add stealth scripts to hide automation indicators
    await page.addInitScript(() => {
        // Remove webdriver property
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });

        // Mock plugins
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
        });

        // Mock languages
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
        });

        // Mock permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) =>
            parameters.name === 'notifications'
                ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
                : originalQuery(parameters);

        // Mock chrome runtime
        (window as any).chrome = {
            runtime: {},
        };

        // Override the `plugins` property to use a custom getter
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
        });

        // Override the `languages` property to use a custom getter
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
        });

        // Override the `permissions` property to use a custom getter
        Object.defineProperty(navigator, 'permissions', {
            get: () => ({
                query: (parameters: any) =>
                    parameters.name === 'notifications'
                        ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
                        : Promise.resolve({ state: 'granted' } as PermissionStatus),
            }),
        });
    });

    // Set realistic viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Add realistic mouse movement
    await page.addInitScript(() => {
        let mouseX = 0;
        let mouseY = 0;
        const handleMouseMove = (event: MouseEvent) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
        };
        document.addEventListener('mousemove', handleMouseMove);
    });

    return page;
}

/**
 * Navigate to a URL with realistic delays and behavior
 */
export async function stealthNavigate(page: Page, url: string, waitTime: number = 3000): Promise<void> {
    // Add random delay before navigation
    const delay = Math.random() * 1000 + 500; // 500-1500ms
    await page.waitForTimeout(delay);

    await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
    });

    // Wait for page to load
    await page.waitForTimeout(waitTime);

    // Simulate realistic scrolling behavior
    await page.evaluate(() => {
        window.scrollTo(0, Math.random() * 100);
    });

    await page.waitForTimeout(500);
}
