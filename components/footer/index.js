import Icon from "@/components/common/icon";

export const CopyrightFooter = ({ className = "" }) => (
  <footer
    className={`footer footer-center p-4 bg-neutral text-neutral-content ${className}`}
  >
    <div className="items-center grid-flow-col">
      <a href={process.env.WEBSITE_URL}>
        <Icon src="/imgs/company_logo.png" size="w-8 h-8" />
      </a>
      <p className="font-sans font-bold">Copyright © 2022</p>
    </div>
  </footer>
);
