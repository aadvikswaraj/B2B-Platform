export async function validateIFSC(ifsc) {
  const code = (ifsc || '').toUpperCase();
  const pattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!pattern.test(code)) return { valid: false, reason: 'invalid-format' };
  try {
    const data = await fetch(`https://ifsc.razorpay.com/${code}`);
    return { valid: true, data };
  } catch (e) {
    // Unable to fetch or not found
    const reason = (e && `${e.message}`.includes('HTTP 404')) ? 'not-found' : 'network-error';
    return { valid: false, reason };
  }
}