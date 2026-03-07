import Image from "next/image";
import Link from "next/link";

type BrandLogoSize =
  | "marketing-header"
  | "marketing-footer"
  | "public-header"
  | "workspace"
  | "portal";

const logoSizeClasses: Record<BrandLogoSize, string> = {
  "marketing-header": "w-[148px] sm:w-[164px]",
  "marketing-footer": "w-[176px] sm:w-[192px]",
  "public-header": "w-[148px] sm:w-[160px]",
  workspace: "w-[138px]",
  portal: "w-[148px] sm:w-[156px]",
};

const logoSizes: Record<BrandLogoSize, string> = {
  "marketing-header": "(min-width: 640px) 164px, 148px",
  "marketing-footer": "(min-width: 640px) 192px, 176px",
  "public-header": "(min-width: 640px) 160px, 148px",
  workspace: "138px",
  portal: "(min-width: 640px) 156px, 148px",
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
      src="/branding/appaffiliate-logo.svg"
      alt="AppAffiliate"
      width={480}
      height={248}
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
