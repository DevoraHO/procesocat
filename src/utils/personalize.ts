export function getPetName(profile: any, t: any): string {
  return profile?.pet_name || t('pet.yourPet');
}

export function personalizeText(text: string, petName: string): string {
  return text
    .replace(/\[mascota\]/g, petName)
    .replace(/\[pet\]/g, petName)
    .replace(/tu perro/gi, petName)
    .replace(/el teu gos/gi, petName)
    .replace(/ton gos/gi, petName);
}
