export const doctorAvatars = {
  male1: 'https://randomuser.me/api/portraits/men/1.jpg',
  male2: 'https://randomuser.me/api/portraits/men/2.jpg',
  male3: 'https://randomuser.me/api/portraits/men/3.jpg',
  female1: 'https://randomuser.me/api/portraits/women/1.jpg',
  female2: 'https://randomuser.me/api/portraits/women/2.jpg',
  female3: 'https://randomuser.me/api/portraits/women/3.jpg',
} as const

export function getDoctorAvatar(index: number): string {
  const avatars = Object.values(doctorAvatars)
  return avatars[index % avatars.length]
}
