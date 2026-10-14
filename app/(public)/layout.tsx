import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getSiteSetting } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

/** JSON-LD Organization + WebSite untuk seluruh halaman publik. */
const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      publisher: { "@id": `${siteConfig.url}/#organization` },
      inLanguage: "id-ID",
    },
  ],
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSiteSetting();

  return (
    <div className="flex min-h-screen flex-col">
      <Header siteName={site.name} logoPath={site.logoPath} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
    </div>
  );
}
