import Image from "next/image";
import Link from "next/link";

type BrandLogoSize =
  | "marketing-header"
  | "marketing-footer"
  | "public-header"
  | "workspace-header"
  | "workspace-compact"
  | "workspace"
  | "portal";

const logoSizeClasses: Record<BrandLogoSize, string> = {
  "marketing-header": "w-[148px] sm:w-[164px]",
  "marketing-footer": "w-[164px] sm:w-[180px]",
  "public-header": "w-[138px] sm:w-[150px]",
  "workspace-header": "w-[118px] sm:w-[132px]",
  "workspace-compact": "w-[96px]",
  workspace: "w-[126px]",
  portal: "w-[138px] sm:w-[148px]",
};

const logoSizes: Record<BrandLogoSize, string> = {
  "marketing-header": "(min-width: 640px) 164px, 148px",
  "marketing-footer": "(min-width: 640px) 180px, 164px",
  "public-header": "(min-width: 640px) 150px, 138px",
  "workspace-header": "(min-width: 640px) 132px, 118px",
  "workspace-compact": "96px",
  workspace: "126px",
  portal: "(min-width: 640px) 148px, 138px",
};

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

const lockupSizes: Partial<
  Record<
    BrandLogoSize,
    {
      containerClassName: string;
      iconClassName: string;
      wordmarkClassName: string;
    }
  >
> = {
  "marketing-header": {
    containerClassName: "h-12 gap-3.5 sm:h-14 sm:gap-4",
    iconClassName: "h-[36px] w-[36px] sm:h-10 sm:w-10",
    wordmarkClassName:
      "hidden text-[17px] font-bold tracking-[-0.02em] text-ink sm:inline-flex",
  },
  "public-header": {
    containerClassName: "h-12 gap-3 sm:h-14 sm:gap-3.5",
    iconClassName: "h-[34px] w-[34px] sm:h-9 sm:w-9",
    wordmarkClassName:
      "hidden text-[16px] font-bold tracking-[-0.02em] text-ink sm:inline-flex",
  },
  "workspace-header": {
    containerClassName: "h-10 gap-2.5 sm:h-11 sm:gap-3",
    iconClassName: "h-[28px] w-[28px] sm:h-[30px] sm:w-[30px]",
    wordmarkClassName:
      "inline-flex text-[14px] font-bold tracking-[-0.02em] text-ink sm:text-[15px]",
  },
};

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
  const lockupConfig = lockupSizes[size];

  if (lockupConfig) {
    return (
      <span
        className={joinClasses(
          "inline-flex h-10 min-w-0 items-center",
          lockupConfig.containerClassName,
          className,
        )}
      >
        <Image
          src="/branding/appaffiliate-logo.png"
          alt=""
          aria-hidden="true"
          width={1024}
          height={1024}
          priority={priority}
          sizes="36px"
          className={joinClasses("shrink-0", lockupConfig.iconClassName)}
        />
        <span className={lockupConfig.wordmarkClassName}>AppAffiliate</span>
      </span>
    );
  }

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
