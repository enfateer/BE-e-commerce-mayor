const PACKAGE_TIERS = ['Basic', 'Gold', 'Pro'];

const normalizeTierName = (name) => {
  const value = String(name || '').trim().toLowerCase();
  return PACKAGE_TIERS.find((tier) => tier.toLowerCase() === value) || null;
};

const sortPackagesByTier = (packages) =>
  [...packages].sort((a, b) => {
    const indexA = PACKAGE_TIERS.indexOf(normalizeTierName(a.name));
    const indexB = PACKAGE_TIERS.indexOf(normalizeTierName(b.name));
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

module.exports = {
  PACKAGE_TIERS,
  normalizeTierName,
  sortPackagesByTier,
};
