import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

// Shared layout for all public marketing pages: nav on top, footer below.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main>{children}</main>
      <PublicFooter />
    </>
  );
}
