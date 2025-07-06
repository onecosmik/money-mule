import MillionLint from '@million/lint';
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['via.placeholder.com', 'files.invicta.capital', 'images.unsplash.com'],
    },
};
export default MillionLint.next({
    rsc: true,
    turbo: true,
})(nextConfig);
