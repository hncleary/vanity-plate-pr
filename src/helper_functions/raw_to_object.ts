/** When a raw  object value is retrieved from a form control group, the constructor of the object is not referenced - causing
 * the JsonObject properties that are responsible for serialization / deserialization to not be present. This function prevents this
 * issue by calling returning an object based off of the constructed type
 */
export function rawToObject<T extends object>(formRaw: object, constructedType: T): T {
    const fr = formRaw as any;
    for (const [key, value] of Object.entries(formRaw)) {
        // Can't use !! here cause value could be 0
        if (value !== null && value !== undefined) {
            constructedType[key as keyof T] = fr[key];
        }
    }
    return constructedType;
}
