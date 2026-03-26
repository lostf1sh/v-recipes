import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
};

export default function AcceptableUsePolicyPage() {
  return (
    <LegalPage title="Acceptable Use Policy">
      <p>Last updated: February 16, 2026</p>

      <p>
        This Acceptable Use Policy (&quot;AUP&quot;) outlines the acceptable use
        of v.recipes. By using our services, you agree to comply with this AUP.
        We reserve the right to modify this policy at any time, and such
        modifications shall be effective immediately upon posting of the modified
        policy on our website.
      </p>

      <h2>1. Prohibited Activities</h2>
      <p>
        You may not use our services to engage in, foster, or promote illegal,
        abusive, or irresponsible behavior, including:
      </p>

      <p>
        <strong>1.1 Illegal or Unauthorized Activities</strong>
      </p>
      <p>Including but not limited to:</p>
      <ul>
        <li>
          Any activity that violates any applicable local, state, national, or
          international law or regulation
        </li>
        <li>
          Unauthorized access to or use of data, systems, or networks, including
          any attempt to probe, scan, or test the vulnerability of a system or
          network or to breach security or authentication measures
        </li>
        <li>
          Monitoring data or traffic on any network or system without the express
          authorization of the owner of the system or network
        </li>
        <li>
          Interference with service to any user, host, or network, including mail
          bombing, flooding, deliberate attempts to overload a system, and
          broadcast attacks
        </li>
      </ul>

      <p>
        <strong>1.2 Harmful Content</strong>
      </p>
      <p>Including but not limited to:</p>
      <ul>
        <li>
          Content that is illegal, harmful, threatening, abusive, harassing,
          tortious, defamatory, vulgar, obscene, libelous, invasive of
          another&apos;s privacy, hateful, or racially, ethnically, or otherwise
          objectionable
        </li>
        <li>
          Content that infringes any patent, trademark, trade secret, copyright,
          or other proprietary rights of any party
        </li>
        <li>
          Content containing software viruses or any other computer code, files,
          or programs designed to interrupt, destroy, or limit the functionality
          of any computer software or hardware or telecommunications equipment
        </li>
        <li>
          Content that constitutes or encourages a criminal offense, gives rise
          to civil liability, or otherwise violates any local, state, national,
          or international law
        </li>
      </ul>

      <p>
        <strong>1.3 Network Abuse</strong>
      </p>
      <p>Including but not limited to:</p>
      <ul>
        <li>
          Sending unsolicited email messages, including the sending of
          &quot;junk mail&quot; or other advertising material to individuals who
          did not specifically request such material (email spam)
        </li>
        <li>
          Collecting or harvesting any personally identifiable information,
          including account names, from our services without the owner&apos;s
          explicit permission
        </li>
        <li>
          Creating a false identity for the purpose of misleading others as to
          the identity of the sender or the origin of a message
        </li>
        <li>
          Using, distributing, or selling lists of v.recipes users or user
          information
        </li>
        <li>
          Employing any mechanisms, software, or scripts to navigate or search
          our services other than generally available third-party web browsers or
          search engines
        </li>
      </ul>

      <h2>2. System and Network Security</h2>
      <p>
        Violations of system or network security are prohibited and may result in
        criminal and civil liability. v.recipes will investigate incidents
        involving such violations and may involve and cooperate with law
        enforcement if a criminal violation is suspected. Examples of system or
        network security violations include, without limitation, the following:
      </p>
      <ul>
        <li>
          Unauthorized access to or use of data, systems, or networks, including
          any attempt to probe, scan, or test the vulnerability of a system or
          network or to breach security or authentication measures without
          express authorization of the owner of the system or network
        </li>
        <li>
          Unauthorized monitoring of data or traffic on any network or system
          without express authorization of the owner of the system or network
        </li>
        <li>
          Interference with service to any user, host, or network including,
          without limitation, mail bombing, flooding, deliberate attempts to
          overload a system, and broadcast attacks
        </li>
        <li>
          Forging of any TCP-IP packet header or any part of the header
          information in an email or a newsgroup posting
        </li>
      </ul>

      <h2>3. DNS Service Specific Restrictions</h2>
      <p>
        When using our DNS services, the following activities are specifically
        prohibited, including but not limited to:
      </p>
      <ul>
        <li>
          Excessive use that negatively impacts the performance of the service
          for other users
        </li>
        <li>
          Using our DNS services to facilitate the distribution of malware,
          phishing, or other malicious activities
        </li>
        <li>
          Attempting to bypass or manipulate our DNS filtering mechanisms
        </li>
        <li>
          Using our DNS services to conduct denial of service attacks or other
          network attacks
        </li>
      </ul>

      <h2>4. Reporting Violations</h2>
      <p>
        If you believe that someone has violated this AUP, please contact us at{" "}
        <a href="mailto:ask@v.recipes">ask@v.recipes</a>. Please provide the
        following information:
      </p>
      <ul>
        <li>Your contact information</li>
        <li>
          The nature and circumstances of the violation, including the date and
          time
        </li>
        <li>
          Any identifying information about the violator, including email
          address, IP address, or username
        </li>
        <li>Any other relevant information</li>
      </ul>

      <h2>5. Consequences of Violation</h2>
      <p>
        Violation of this AUP may result in the immediate suspension or
        termination of your service, without prior notice. We may also take any
        one or more of the following actions in response to violations of this
        AUP:
      </p>
      <ul>
        <li>Issue warnings</li>
        <li>Suspend or terminate the service</li>
        <li>
          Bill you for administrative costs and/or reactivation charges
        </li>
        <li>
          Bring legal action to enjoin violations and/or to collect damages, if
          any, caused by violations
        </li>
        <li>
          Release information about the violation to law enforcement as required
          or permitted by law
        </li>
      </ul>

      <h2>6. Contact Information</h2>
      <p>
        If you have questions about this Acceptable Use Policy, please contact us
        at: <a href="mailto:ask@v.recipes">ask@v.recipes</a>
      </p>
    </LegalPage>
  );
}
