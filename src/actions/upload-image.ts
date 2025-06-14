/**
 * Mocked action for uploading images
 * Simulates async upload and returns a mocked URL
 */
export async function uploadImageAction(file: File): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock upload success and return the mocked URL
  const mockUrl = "https://picsum.photos/id/237/200/300";

  console.log(`Mocked upload for file: ${file.name}, returning URL: ${mockUrl}`);

  return mockUrl;
}
