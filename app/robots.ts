export default function robots() {
    return {
        rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
        sitemap: "https://www.ehsadvogados.com.br/sitemap.xml",
    };
}
