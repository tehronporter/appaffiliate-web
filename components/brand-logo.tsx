import Image from "next/image";
import Link from "next/link";

type BrandLogoSize =
  | "marketing-header"
  | "marketing-footer"
  | "public-header"
  | "workspace"
  | "portal";

const logoSizeClasses: Record<BrandLogoSize, string> = {
  "marketing-header": "w-[138px] sm:w-[152px]",
  "marketing-footer": "w-[164px] sm:w-[180px]",
  "public-header": "w-[138px] sm:w-[150px]",
  workspace: "w-[126px]",
  portal: "w-[138px] sm:w-[148px]",
};

const logoSizes: Record<BrandLogoSize, string> = {
  "marketing-header": "(min-width: 640px) 152px, 138px",
  "marketing-footer": "(min-width: 640px) 180px, 164px",
  "public-header": "(min-width: 640px) 150px, 138px",
  workspace: "126px",
  portal: "(min-width: 640px) 148px, 138px",
};

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type BrandLogoProps = {
  size?: BrandLogoSize;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  size = "marketing-header",
  className,
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/branding/appaffiliatelogotransparent222.png"
      alt="AppAffiliate"
      width={2000}
      height={2000}
      priority={priority}
      sizes={logoSizes[size]}
      className={joinClasses("h-auto", logoSizeClasses[size], className)}
    />
  );
}

type BrandLogoLinkProps = BrandLogoProps & {
  href?: string;
  ariaLabel?: string;
};

export function BrandLogoLink({
  href = "/",
  ariaLabel = "AppAffiliate home",
  ...props
}: BrandLogoLinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="inline-flex shrink-0 items-center"
    >
      <BrandLogo {...props} />
    </Link>
  );
}
