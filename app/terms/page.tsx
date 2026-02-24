export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">Terms & Conditions</h1>
      <p className="mt-4 text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="mt-8 prose prose-invert max-w-none text-slate-400">
        <p>By using Nova Rides you agree to these terms. Nova Rides is a peer-to-peer car sharing platform connecting hosts and renters. Users must be of legal age and hold a valid driver’s license. Hosts are responsible for listing accurate vehicle information and maintaining valid insurance. Renters must return the vehicle on time and in the condition received. The platform may charge service fees and handle payments as described in the payment policy. Disputes are subject to our dispute resolution process. We may suspend or terminate accounts for violations.</p>
      </div>
    </div>
  );
}
