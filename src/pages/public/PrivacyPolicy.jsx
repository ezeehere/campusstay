import LegalDocumentPage, {
  LegalContactBlock,
  LegalList,
  LegalSection,
  LegalSubheading,
} from "../../components/public/LegalDocumentPage";
import { PRIVACY_VERSION } from "../../config/legal";

function PrivacyPolicy() {
  return (
    <LegalDocumentPage title="Privacy Policy" version={PRIVACY_VERSION}>
      <div className="space-y-3">
        <p>
          CampusStay respects your privacy and is committed to handling your
          personal information responsibly. This Privacy Policy explains what
          information CampusStay collects, why it is collected, how it may be
          used or shared, and the choices available to you.
        </p>
        <p>
          This Privacy Policy applies when you visit, register, submit
          information, save a listing, contact a property owner, request a
          callback, report a listing, or otherwise use CampusStay through
          campusstay.in or its related services.
        </p>
      </div>

      <LegalSection title="1. About CampusStay">
        <p>
          CampusStay is a platform that helps students and parents find PGs,
          rooms, hostels, and rental stays near educational institutions.
        </p>
        <p>
          CampusStay allows users to view property information and communicate
          directly with property owners or managers. CampusStay does not
          currently collect rent, deposits, advance payments, or booking payments
          on behalf of property owners.
        </p>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <p>
          Depending on how you use CampusStay, we may collect the following
          information:
        </p>

        <LegalSubheading>Account Information</LegalSubheading>
        <LegalList
          items={[
            "Full name",
            "Email address",
            "Phone number",
            "Account identifier",
            "Login and authentication information",
          ]}
        />

        <LegalSubheading>Student Preference Information</LegalSubheading>
        <LegalList
          items={[
            "Institution",
            "Gender or stay suitability",
            "Minimum and maximum budget",
            "Preferred areas",
            "Preferred stay type",
            "Food preference",
            "Room sharing preference",
            "Expected move-in time",
            "Terms acceptance status and date",
            "Privacy Policy acceptance status and date",
          ]}
        />

        <LegalSubheading>Platform Activity</LegalSubheading>
        <LegalList
          items={[
            "Saved listings",
            "Listing views",
            "Search and filter activity",
            "Call button clicks",
            "WhatsApp button clicks",
            "Map button clicks",
            "Share activity",
            "Callback or contact requests",
            "Reports submitted about listings",
            "Date and time of platform activity",
          ]}
        />

        <LegalSubheading>Technical Information</LegalSubheading>
        <p>
          Where applicable, CampusStay or its service providers may automatically
          collect limited technical information, including:
        </p>
        <LegalList
          items={[
            "Browser type",
            "Device type",
            "Operating system",
            "IP address",
            "Approximate location based on network information",
            "Referring page",
            "Website performance information",
            "Error and security logs",
          ]}
        />
        <p>CampusStay may not collect every category listed above from every user.</p>
      </LegalSection>

      <LegalSection title="3. How We Collect Information">
        <p>CampusStay may collect information when you:</p>
        <LegalList
          items={[
            "Create or use an account",
            "Complete or update your student preferences",
            "Save a listing",
            "View or interact with a listing",
            "Call or message a property owner",
            "Request a callback",
            "Submit a report",
            "Contact CampusStay",
            "Use website features, cookies, local storage, or similar technologies",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. How We Use Information">
        <p>CampusStay may use collected information to:</p>
        <LegalList
          items={[
            "Create and manage user accounts",
            "Save and display student preferences",
            "Recommend relevant PGs, rooms, hostels, or rental stays",
            "Allow users to save and manage shortlisted listings",
            "Support direct communication between students and property owners",
            "Process callback or contact requests",
            "Respond to questions, complaints, or reports",
            "Review listing activity and platform performance",
            "Improve search results and student experience",
            "Detect fraud, misuse, security threats, or technical issues",
            "Maintain platform safety and reliability",
            "Comply with applicable legal requirements",
            "Protect the rights and interests of CampusStay, its users, and property owners",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Consent and Lawful Use">
        <p>
          By using CampusStay or submitting your information, you consent to the
          collection and use of your information as described in this Privacy
          Policy.
        </p>
        <p>
          Where required, CampusStay will request clear consent before collecting
          or using personal information for a stated purpose.
        </p>
        <p>
          CampusStay may also process information where necessary to provide a
          service requested by you, protect platform security, respond to legal
          requirements, or perform another use permitted under applicable law.
        </p>
        <p>
          You may withdraw your consent by contacting CampusStay. Withdrawal of
          consent may affect features that require the relevant information.
        </p>
      </LegalSection>

      <LegalSection title="6. Saved Listings and Interaction Analytics">
        <p>
          CampusStay may record activities such as listing views, saved listings,
          call clicks, WhatsApp clicks, map clicks, reports, and callback
          requests.
        </p>
        <p>This information may be used to:</p>
        <LegalList
          items={[
            "Show users their saved listings",
            "Improve listing recommendations",
            "Understand which listings are useful to students",
            "Provide basic performance information to authorised property owners",
            "Detect unusual activity or misuse",
            "Improve CampusStay services",
          ]}
        />
        <p>
          CampusStay should not provide property owners with unnecessary personal
          information merely because a user viewed or saved a listing.
        </p>
      </LegalSection>

      <LegalSection title="7. Communication With Property Owners">
        <p>
          Property owner contact information may be shown on listing pages so
          students and parents can communicate directly with the owner or manager.
        </p>
        <p>
          When you call, message, or use an external communication service, that
          service may process your information according to its own privacy
          policy.
        </p>
        <p>
          When you request a callback or submit a contact lead, CampusStay may
          share the information required for the selected property owner or
          manager to respond to your request.
        </p>
        <p>
          Users should avoid sharing sensitive financial information, passwords,
          identity documents, or payment credentials through unverified
          communication channels.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies and Similar Technologies">
        <p>
          CampusStay may use cookies, local storage, session storage, and similar
          technologies to:
        </p>
        <LegalList
          items={[
            "Keep users signed in",
            "Remember user preferences",
            "Maintain saved settings",
            "Improve website performance",
            "Analyze platform usage",
            "Detect errors or security issues",
            "Improve the overall user experience",
          ]}
        />
        <p>
          Users may control certain cookie settings through their browser.
          Blocking cookies or storage may prevent some CampusStay features from
          working correctly.
        </p>
      </LegalSection>

      <LegalSection title="9. Third-Party Services">
        <p>
          CampusStay may use trusted third-party services to operate and improve
          the platform. These may include:
        </p>
        <LegalList
          items={[
            "Authentication providers",
            "Cloud database and hosting providers",
            "Website hosting services",
            "Map providers",
            "Analytics and performance tools",
            "Email services",
            "Image hosting services",
            "Communication platforms",
            "Security and error-monitoring tools",
          ]}
        />
        <p>
          These providers may process limited information on behalf of CampusStay
          or when you choose to use their services. Their handling of information
          is also governed by their own privacy policies and service terms.
        </p>
        <p>
          Some third-party providers may process information from locations
          outside India, subject to their service arrangements and applicable law.
        </p>
      </LegalSection>

      <LegalSection title="10. Sharing of Information">
        <p>CampusStay may share information only where reasonably required:</p>
        <LegalList
          items={[
            "With a property owner when you request direct contact or a callback",
            "With service providers that operate CampusStay systems",
            "To investigate fraud, abuse, security incidents, or illegal activity",
            "To comply with a court order, government request, or legal obligation",
            "To protect CampusStay, its users, property owners, or the public",
            "During a business restructuring, merger, acquisition, or transfer, subject to applicable law and appropriate notice",
          ]}
        />
        <p>CampusStay does not currently sell users' personal information to third parties.</p>
        <p>
          If this practice changes in the future, CampusStay will update this
          Privacy Policy and, where required by applicable law, notify users or
          obtain the required consent.
        </p>
      </LegalSection>

      <LegalSection title="11. Property Information and Listing Accuracy">
        <p>
          CampusStay works to maintain useful and accurate property information.
          However, listing descriptions, pricing, availability, photographs,
          facilities, food details, seat availability, rules, and other property
          information may be provided or confirmed by property owners or managers.
        </p>
        <p>
          Students and parents must independently visit the property, speak with
          the owner, inspect facilities, verify availability, confirm all
          charges, and review applicable conditions before making any payment or
          commitment.
        </p>
        <p>
          A listing marked as verified does not guarantee legal ownership, title,
          safety, quality, availability, or suitability for a particular user.
        </p>
      </LegalSection>

      <LegalSection title="12. Payments and Financial Information">
        <p>
          CampusStay does not currently collect rent, security deposits, booking
          payments, advance payments, or payment card details for property
          transactions.
        </p>
        <p>
          Any payment made directly to a property owner or manager is an
          arrangement between the user and that property owner or manager.
        </p>
        <p>
          Students and parents should visit and independently verify a property
          before making any payment.
        </p>
      </LegalSection>

      <LegalSection title="13. Data Retention">
        <p>CampusStay retains personal information only for as long as reasonably necessary to:</p>
        <LegalList
          items={[
            "Provide CampusStay services",
            "Maintain user accounts and preferences",
            "Maintain platform security",
            "Prevent fraud and misuse",
            "Resolve disputes and complaints",
            "Meet legal or regulatory obligations",
            "Maintain necessary business and technical records",
            "Improve CampusStay services",
          ]}
        />
        <p>
          Retention periods may vary based on the type of information and the
          purpose for which it was collected.
        </p>
        <p>
          Users may request deletion of their personal information, subject to
          applicable legal, security, fraud-prevention, record-keeping, and
          operational requirements.
        </p>
        <p>
          Anonymous or aggregated information that no longer identifies a user
          may be retained for analytics and service improvement.
        </p>
      </LegalSection>

      <LegalSection title="14. Data Security">
        <p>
          CampusStay uses reasonable technical and organisational measures
          intended to protect personal information against unauthorised access,
          alteration, disclosure, loss, or misuse.
        </p>
        <p>
          However, no online service, database, or method of electronic
          transmission can guarantee complete security. Users are responsible for
          keeping their passwords and devices secure.
        </p>
        <p>
          Users should contact CampusStay immediately if they believe their
          account or personal information has been accessed without permission.
        </p>
      </LegalSection>

      <LegalSection title="15. Access, Correction, and Removal">
        <p>Users may request:</p>
        <LegalList
          items={[
            "Access to personal information held by CampusStay",
            "Correction of inaccurate or incomplete information",
            "Updating of account or preference information",
            "Deletion of personal information",
            "Withdrawal of consent",
            "Information about how their personal information is being used",
            "Review of a privacy complaint or concern",
          ]}
        />
        <p>
          Requests may be submitted using the contact information provided below.
        </p>
        <p>
          CampusStay will review and respond to legitimate requests within a
          reasonable time, subject to identity verification and applicable legal,
          security, fraud-prevention, and operational requirements.
        </p>
        <p>
          Certain information may be retained where required for legal
          compliance, dispute resolution, security, fraud prevention, or
          necessary business records.
        </p>
      </LegalSection>

      <LegalSection title="16. Account Deletion">
        <p>
          A user may request deletion of their CampusStay account and related
          personal information by contacting CampusStay.
        </p>
        <p>
          Before processing a deletion request, CampusStay may request
          information needed to verify the account owner.
        </p>
        <p>
          Deleting an account may remove access to saved listings, preferences,
          recommendations, reports, and other account-linked features.
        </p>
        <p>
          Some limited records may be retained where required by law or
          reasonably necessary for security, fraud prevention, dispute
          resolution, or enforcement of CampusStay policies.
        </p>
      </LegalSection>

      <LegalSection title="17. Information About Minors">
        <p>
          CampusStay may be used by students who are below 18 years of age.
        </p>
        <p>
          Users below 18 should use CampusStay with the involvement and
          supervision of a parent or legal guardian. A parent or guardian should
          review property details, communicate with property owners, visit the
          property, and approve any payment or rental decision.
        </p>
        <p>
          CampusStay does not knowingly request more personal information from
          minors than is reasonably required to provide the service.
        </p>
        <p>
          A parent or guardian may contact CampusStay regarding personal
          information submitted by a minor.
        </p>
      </LegalSection>

      <LegalSection title="18. User Responsibilities">
        <p>Users should:</p>
        <LegalList
          items={[
            "Provide accurate information",
            "Keep account credentials secure",
            "Avoid sharing passwords or payment credentials",
            "Review property information independently",
            "Report suspicious listings or communication",
            "Inform CampusStay when account information is incorrect or outdated",
          ]}
        />
      </LegalSection>

      <LegalSection title="19. Changes to This Privacy Policy">
        <p>CampusStay may update this Privacy Policy to reflect:</p>
        <LegalList
          items={[
            "Changes to CampusStay services",
            "Changes in data practices",
            "New features or service providers",
            "Security requirements",
            "Business changes",
            "Changes in applicable law",
          ]}
        />
        <p>
          The updated version will be published on this page with a revised Last
          Updated date and version number.
        </p>
        <p>
          Where required by applicable law, CampusStay may provide additional
          notice or request renewed consent.
        </p>
        <p>
          Continued use of CampusStay after an updated Privacy Policy becomes
          effective means that the updated policy will apply to future use,
          subject to any consent required by law.
        </p>
      </LegalSection>

      <LegalSection title="20. Applicable Law">
        <p>This Privacy Policy is governed by the laws of India.</p>
        <p>
          Privacy matters and disputes relating to the use of CampusStay will be
          handled according to applicable Indian laws and the jurisdiction of
          competent courts.
        </p>
      </LegalSection>

      <LegalSection title="21. Privacy Requests and Complaints">
        <p>
          Users may contact CampusStay to request access, correction, deletion,
          consent withdrawal, account removal, or review of a privacy concern.
        </p>
        <LegalContactBlock />
        <p>
          CampusStay will make reasonable efforts to review and respond to
          legitimate requests in a timely manner.
        </p>
      </LegalSection>
    </LegalDocumentPage>
  );
}

export default PrivacyPolicy;