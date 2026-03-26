import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service">
      <p>Last updated: February 16, 2026</p>

      <p>
        Welcome to v.recipes. Please read these Terms of Service
        (&quot;Terms&quot;) carefully as they contain important information about
        your legal rights, remedies, and obligations. By accessing or using
        v.recipes, you agree to comply with and be bound by these Terms.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using any services provided by v.recipes
        (&quot;Services&quot;), you agree to be bound by these Terms. If you do
        not agree to these Terms, please do not use our Services.
      </p>
      <p>
        We may modify these Terms at any time. Your continued use of the Services
        after any such changes constitutes your acceptance of the new Terms. It
        is your responsibility to review these Terms periodically.
      </p>

      <h2>2. Description of Services</h2>
      <p>
        v.recipes provides DNS resolution services and other web services as
        described on our website. We do not provide hosting services.
      </p>
      <p>
        We reserve the right to modify, suspend, or discontinue any part of the
        Services at any time without prior notice.
      </p>

      <h2>3. User Accounts</h2>
      <p>
        Some of our Services may require you to create an account. You are
        responsible for maintaining the confidentiality of your account
        information and for all activities that occur under your account.
      </p>
      <p>
        You agree to provide accurate and complete information when creating an
        account and to update your information to keep it accurate and current.
      </p>
      <p>
        We reserve the right to suspend or terminate your account if any
        information provided is found to be inaccurate, false, or outdated.
      </p>

      <h2>4. User Conduct</h2>
      <p>
        You agree to use the Services only for lawful purposes and in accordance
        with these Terms. You agree not to use the Services:
      </p>
      <ul>
        <li>
          In any way that violates any applicable federal, state, local, or
          international law or regulation
        </li>
        <li>
          To transmit any material that is defamatory, obscene, or offensive
        </li>
        <li>
          To impersonate or attempt to impersonate v.recipes, a v.recipes
          employee, or any other person or entity
        </li>
        <li>
          To engage in any conduct that restricts or inhibits anyone&apos;s use
          or enjoyment of the Services
        </li>
        <li>
          To attempt to gain unauthorized access to, interfere with, damage, or
          disrupt any parts of the Services
        </li>
      </ul>

      <h2>5. Intellectual Property</h2>
      <p>
        The Services and their entire contents, features, and functionality
        (including but not limited to all information, software, text, displays,
        images, and the design, selection, and arrangement thereof) are owned by
        v.recipes, its licensors, or other providers of such material and are
        protected by copyright, trademark, and other intellectual property laws.
      </p>
      <p>
        You may not reproduce, distribute, modify, create derivative works of,
        publicly display, publicly perform, republish, download, store, or
        transmit any of the material on our Services without our prior written
        consent.
      </p>

      <h2>6. Privacy</h2>
      <p>
        Your use of the Services is also governed by our Privacy Policy, which is
        incorporated into these Terms by reference. Please review our Privacy
        Policy to understand our practices regarding your personal information.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        In no event will v.recipes, its affiliates, or their licensors, service
        providers, employees, agents, officers, or directors be liable for
        damages of any kind, under any legal theory, arising out of or in
        connection with your use, or inability to use, the Services, including
        any direct, indirect, special, incidental, consequential, or punitive
        damages.
      </p>

      <h2>8. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless v.recipes, its
        affiliates, licensors, and service providers, and its and their
        respective officers, directors, employees, contractors, agents,
        licensors, suppliers, successors, and assigns from and against any
        claims, liabilities, damages, judgments, awards, losses, costs, expenses,
        or fees (including reasonable attorneys&apos; fees) arising out of or
        relating to your violation of these Terms or your use of the Services.
      </p>

      <h2>9. Termination</h2>
      <p>
        We may terminate or suspend your access to all or part of the Services,
        without notice, for any conduct that we, in our sole discretion, believe
        violates these Terms or is harmful to other users of the Services, us, or
        third parties, or for any other reason.
      </p>

      <h2>10. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the
        laws of the jurisdiction in which v.recipes operates, without regard to
        its conflict of law provisions.
      </p>

      <h2>11. Contact Information</h2>
      <p>
        If you have any questions about these Terms, please contact us at{" "}
        <a href="mailto:ask@v.recipes">ask@v.recipes</a>.
      </p>
    </LegalPage>
  );
}
