/**
 * This catch-all route in the @authentication slot ensures that when a client-side navigation
 * results in a non-matching parallel route, the corresponding slot renders `null`,
 * effectively closing the modal by having the slot unmount its content.
 *
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes#closing-the-modal
 */
export default async function AuthenticationCatchAllPage() {
  return null;
}
