
export const incrementalName = (name: string, existingNames: string[] = []) => {
  let incrementedName = name;
  let index = 1;

  while (existingNames.includes(incrementedName)) {
    incrementedName = name + " " + index++;
  }

  return incrementedName;
}