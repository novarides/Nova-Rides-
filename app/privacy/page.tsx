export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-[var(--black)]">Privacy Policy</h1>
      <p className="mt-4 text-[var(--grey-600)]">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="mt-8 prose max-w-none text-[var(--grey-600)]">
        <p>Nova Rides collects information you provide (name, email, phone, payment details, ID documents) to operate the service, process bookings, and comply with legal obligations. We may share data with hosts/renters as needed for trips and with payment and identity verification providers. We do not sell your personal data. You can request access or deletion of your data. By using Nova Rides you accept this privacy policy.</p>
      </div>
    </div>
  );
}
