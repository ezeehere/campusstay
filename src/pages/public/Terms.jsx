import { Link } from "react-router";

import LegalDocumentPage, {
  LegalContactBlock,
  LegalList,
  LegalSection,
} from "../../components/public/LegalDocumentPage";
import { TERMS_VERSION } from "../../config/legal";

function Terms() {
  return (
    <LegalDocumentPage title="Terms & Conditions" version={TERMS_VERSION}>
      <div className="space-y-3">
        <p>
          These Terms & Conditions govern your access to and use of CampusStay
          through campusstay.in and its related services.
        </p>
        <p>
          By accessing, browsing, registering, or using CampusStay, you confirm
          that you have read, understood, and agreed to these Terms & Conditions
          and the CampusStay{" "}
          <Link to="/privacy" className="font-bold text-[#1E5B4F] underline">
            Privacy Policy
          </Link>
          .
        </p>
        <p>Do not use CampusStay if you do not agree to these Terms.</p>
      </div>

      <LegalSection title="1. About CampusStay">
        <p>
          CampusStay is a property information and communication platform that
          helps students and parents find PGs, rooms, hostels, and rental stays
          near educational institutions.
        </p>
        <p>
          CampusStay allows users to view listing information and contact
          property owners or managers directly.
        </p>
        <p>CampusStay is not:</p>
        <LegalList
          items={[
            "A property owner",
            "A landlord",
            "A tenant",
            "A broker in the rental agreement",
            "A guarantor of any property or user",
            "A party to rental agreements between users and property owners",
            "A payment collection service for rent, deposits, or booking amounts",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <p>You must be legally capable of accepting these Terms.</p>
        <p>
          Users below 18 years of age should use CampusStay only with the
          involvement and supervision of a parent or legal guardian.
        </p>
        <p>
          Parents or guardians are responsible for reviewing property
          information, communicating with owners, visiting properties, and
          approving payments or rental decisions made for a minor.
        </p>
      </LegalSection>

      <LegalSection title="3. User Accounts">
        <p>Certain CampusStay features may require users to create an account.</p>
        <p>When creating or using an account, you agree that:</p>
        <LegalList
          items={[
            "All information you provide is true, current, and accurate",
            "You will update information when it changes",
            "You will keep your login credentials secure",
            "You will not share your account or password with another person",
            "You are responsible for activities performed through your account",
            "You will notify CampusStay if you suspect unauthorised account access",
            "You will not create an account using another person's identity without permission",
          ]}
        />
        <p>
          CampusStay is not responsible for loss caused by unauthorised account
          use resulting from a user's failure to protect their credentials.
        </p>
        <p>
          CampusStay may request reasonable information to verify an account,
          listing, complaint, or ownership claim.
        </p>
      </LegalSection>

      <LegalSection title="4. Student Preferences">
        <p>
          Students may submit preferences including institution, phone number,
          gender or stay suitability, budget, preferred areas, stay type, food
          preference, room sharing preference, and expected move-in time.
        </p>
        <p>
          Users are responsible for ensuring that preference information is
          accurate.
        </p>
        <p>
          Recommendations are based on available listing information, submitted
          preferences, filters, and platform logic. A recommendation does not
          guarantee that a property is available, suitable, safe, or acceptable
          to the user.
        </p>
      </LegalSection>

      <LegalSection title="5. Property Listings">
        <p>Property listings may include:</p>
        <LegalList
          items={[
            "Property name",
            "Address or area",
            "Photographs",
            "Rent",
            "Deposit information",
            "Room types",
            "Seat availability",
            "Food availability",
            "Facilities",
            "Property rules",
            "Owner or manager contact information",
            "Suitable student category",
            "Map information",
            "Move-in information",
          ]}
        />
        <p>
          Listing information may be provided, confirmed, or updated by property
          owners, property managers, CampusStay representatives, or authorised
          contributors.
        </p>
        <p>
          Property owners and managers are responsible for ensuring that listing
          information is lawful, accurate, current, and not misleading.
        </p>
      </LegalSection>

      <LegalSection title="6. Listing Accuracy and Availability">
        <p>CampusStay works to maintain useful and accurate property information. However:</p>
        <LegalList
          items={[
            "Prices may change",
            "Availability may change",
            "Seats may be filled",
            "Facilities may differ from photographs or descriptions",
            "Food, electricity, water, internet, and other services may change",
            "Property rules may be updated",
            "Owners may provide incomplete or outdated information",
          ]}
        />
        <p>
          CampusStay does not guarantee the accuracy, completeness,
          availability, safety, legality, quality, or suitability of any listing.
        </p>
        <p>
          Students and parents must independently verify every important detail
          before making a decision.
        </p>
      </LegalSection>

      <LegalSection title="7. Meaning of Verified Listings">
        <p>
          A CampusStay verified label may indicate that basic listing checks were
          completed, such as visiting the location, confirming selected
          information, speaking with the owner or manager, or reviewing available
          property details.
        </p>
        <p>A verified label does not mean that CampusStay guarantees:</p>
        <LegalList
          items={[
            "Legal ownership or title",
            "Government approval",
            "Building safety",
            "Fire safety",
            "Police verification",
            "Owner identity in every respect",
            "Absence of disputes",
            "Quality of food or services",
            "Accuracy of every listing detail",
            "Continued availability",
            "Suitability for a specific student",
            "Future conduct of an owner, manager, tenant, or visitor",
          ]}
        />
        <p>
          Users must perform their own checks before making any payment or rental
          commitment.
        </p>
      </LegalSection>

      <LegalSection title="8. Property Visits and User Verification">
        <p>
          Before making a payment or agreeing to stay at a property, students and
          parents should:
        </p>
        <LegalList
          items={[
            "Visit the property in person",
            "Speak directly with the owner or authorised manager",
            "Confirm the owner's identity and authority",
            "Inspect the room and common areas",
            "Confirm rent, deposit, advance, and other charges",
            "Confirm available seats and room sharing",
            "Review food, electricity, water, internet, and maintenance arrangements",
            "Review entry times, visitor rules, refund terms, and notice periods",
            "Request written receipts for payments",
            "Read any rental agreement before signing",
            "Avoid making urgent payments based only on calls or messages",
          ]}
        />
        <p>
          CampusStay is not responsible when a user proceeds without performing
          reasonable checks.
        </p>
      </LegalSection>

      <LegalSection title="9. Payments and Rental Agreements">
        <p>
          CampusStay does not currently collect rent, deposits, booking payments,
          advance payments, or other property payments on behalf of owners.
        </p>
        <p>
          Payments made directly to a property owner or manager are separate
          arrangements between the user and that property owner or manager.
        </p>
        <p>CampusStay is not responsible for:</p>
        <LegalList
          items={[
            "Refunds",
            "Deposit disputes",
            "Rent disputes",
            "Payment fraud",
            "Failed transactions",
            "Informal payment agreements",
            "Rental agreement violations",
            "Changes in property pricing",
            "Owner or tenant conduct",
          ]}
        />
        <p>
          CampusStay currently does not charge students a broker fee for
          accessing listed properties. Any future paid feature will be clearly
          shown before the user chooses to use it.
        </p>
      </LegalSection>

      <LegalSection title="10. Property Owner Responsibilities">
        <p>Property owners and managers using CampusStay must:</p>
        <LegalList
          items={[
            "Provide accurate property information",
            "Have the right or authority to list the property",
            "Use current and genuine property photographs",
            "Clearly disclose rent, deposits, and additional charges",
            "Keep availability information reasonably updated",
            "Avoid false claims or misleading descriptions",
            "Treat students and parents respectfully",
            "Follow applicable housing, safety, tax, licensing, and other legal requirements",
            "Avoid discrimination prohibited by applicable law",
            "Protect information received from users",
            "Avoid requesting unnecessary sensitive information",
            "Provide receipts or agreements where legally required",
            "Inform CampusStay about major listing changes",
          ]}
        />
        <p>
          CampusStay may remove or restrict a listing that appears false,
          misleading, unsafe, unlawful, duplicated, inactive, or inconsistent
          with these Terms.
        </p>
      </LegalSection>

      <LegalSection title="11. Communication">
        <p>
          CampusStay may support communication between students, parents,
          property owners, and managers through phone links, WhatsApp links,
          contact requests, callback requests, or similar features.
        </p>
        <p>Users must not:</p>
        <LegalList
          items={[
            "Send spam",
            "Harass another person",
            "Use threatening, abusive, or discriminatory language",
            "Share illegal, harmful, or deceptive content",
            "Send malware or suspicious links",
            "Request passwords or payment credentials",
            "Use contact information for unrelated marketing",
            "Continue contacting someone after being asked to stop",
          ]}
        />
        <p>
          Misuse of communication features may result in account restriction or
          termination.
        </p>
        <p>
          External communication services operate under their own terms and
          privacy policies.
        </p>
      </LegalSection>

      <LegalSection title="12. Reports and Complaints">
        <p>Users may report:</p>
        <LegalList
          items={[
            "Incorrect information",
            "Suspicious listings",
            "Duplicate listings",
            "Unavailable properties",
            "Misleading pricing",
            "Abusive communication",
            "Safety concerns",
            "Payment concerns",
            "Other possible violations",
          ]}
        />
        <p>
          CampusStay may review reports and take action based on available
          information.
        </p>
        <p>
          Submitting a report does not guarantee immediate removal,
          investigation, recovery of money, or a specific result.
        </p>
        <p>
          Users should contact appropriate authorities where there is immediate
          danger, suspected crime, fraud, or another serious legal issue.
        </p>
      </LegalSection>

      <LegalSection title="13. Prohibited Activities">
        <p>Users must not:</p>
        <LegalList
          items={[
            "Create fake or misleading accounts",
            "Upload false property listings",
            "Impersonate another person or organisation",
            "Misrepresent property ownership or authority",
            "Submit fraudulent reports",
            "Attempt unauthorised access to an account, database, system, or admin area",
            "Interfere with platform operation",
            "Exploit technical errors",
            "Reverse engineer restricted parts of the platform",
            "Bypass security controls",
            "Use bots, automated scripts, or scraping tools without written permission",
            "Copy or collect user or owner information in bulk",
            "Upload or spread malware or harmful software",
            "Use CampusStay for unlawful activity",
            "Violate another person's privacy or intellectual property rights",
            "Use listing contact details for unrelated commercial marketing",
            "Attempt to manipulate views, saves, reports, leads, or platform analytics",
          ]}
        />
        <p>
          Violation may result in content removal, account restriction, permanent
          termination, or legal action where applicable.
        </p>
      </LegalSection>

      <LegalSection title="14. User-Submitted Content">
        <p>
          Users, owners, and managers may submit property information,
          photographs, descriptions, reports, messages, or other content.
        </p>
        <p>The person submitting content confirms that:</p>
        <LegalList
          items={[
            "They have the right to submit it",
            "It is accurate to the best of their knowledge",
            "It does not violate another person's rights",
            "It is not illegal, harmful, threatening, or misleading",
            "It does not contain malware or hidden harmful material",
          ]}
        />
        <p>
          The person submitting content retains ownership of content they legally
          own.
        </p>
        <p>
          By submitting content to CampusStay, they grant CampusStay a
          non-exclusive, royalty-free permission to store, use, reproduce,
          format, display, and distribute that content only as reasonably needed
          to operate, promote, secure, and improve CampusStay.
        </p>
        <p>
          This permission ends when the content is removed, except where
          continued retention is reasonably required for backups, legal
          obligations, dispute records, security, or content already shared
          outside CampusStay.
        </p>
      </LegalSection>

      <LegalSection title="15. CampusStay Intellectual Property">
        <p>
          CampusStay branding, logos, website design, original graphics,
          software, source code, written content, and other material created or
          licensed by CampusStay are protected by applicable intellectual
          property laws.
        </p>
        <p>
          Users may not copy, reproduce, modify, publish, sell, license,
          distribute, or commercially use CampusStay-owned material without prior
          written permission.
        </p>
        <p>
          Property photographs and descriptions submitted by owners remain
          subject to the rights of their original owners and the content
          permission described in these Terms.
        </p>
      </LegalSection>

      <LegalSection title="16. Third-Party Services and Links">
        <p>
          CampusStay may contain links or connections to third-party services,
          including:
        </p>
        <LegalList
          items={[
            "Maps",
            "Phone services",
            "WhatsApp or other communication platforms",
            "Authentication providers",
            "Email services",
            "Cloud services",
            "External websites",
          ]}
        />
        <p>
          CampusStay does not control every third-party service and is not
          responsible for its content, availability, security, privacy practices,
          or actions.
        </p>
        <p>
          Users should review the terms and privacy policies of third-party
          services before using them.
        </p>
      </LegalSection>

      <LegalSection title="17. Privacy">
        <p>
          Use of personal information on CampusStay is governed by the CampusStay
          Privacy Policy available at:
        </p>
        <p>
          <Link to="/privacy" className="font-bold text-[#1E5B4F] underline">
            https://www.campusstay.in/privacy
          </Link>
        </p>
        <p>
          By creating an account, submitting preferences, requesting contact, or
          using other data-based features, users agree to the handling of
          information described in the Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection title="18. Suspension and Termination">
        <p>
          CampusStay may suspend, restrict, deactivate, or permanently terminate
          an account or listing where CampusStay reasonably believes that:
        </p>
        <LegalList
          items={[
            "These Terms have been violated",
            "Information is false or misleading",
            "Fraud or abuse may have occurred",
            "A user presents a security or safety risk",
            "A listing may be unlawful",
            "Another person's rights may have been violated",
            "CampusStay is required to act by law or an authority",
            "Continued access may harm CampusStay or its users",
          ]}
        />
        <p>
          Where reasonable, CampusStay may request clarification or correction
          before taking action. Serious security, fraud, safety, or legal
          concerns may result in immediate action without prior notice.
        </p>
      </LegalSection>

      <LegalSection title="19. Updates to the Platform">
        <p>
          CampusStay may add, modify, restrict, suspend, discontinue, or remove a
          feature or service at any time.
        </p>
        <p>CampusStay does not guarantee that:</p>
        <LegalList
          items={[
            "Every feature will always remain available",
            "The platform will always operate without interruption",
            "Errors will always be corrected immediately",
            "Listings will always remain published",
            "A particular property or institution will always be supported",
          ]}
        />
        <p>
          CampusStay may temporarily limit access for maintenance, updates,
          security work, technical issues, or operational reasons.
        </p>
      </LegalSection>

      <LegalSection title="20. Disclaimer of Warranties">
        <p>CampusStay is provided on an as-available basis.</p>
        <p>
          To the extent permitted by law, CampusStay does not provide warranties
          regarding:
        </p>
        <LegalList
          items={[
            "Continuous platform availability",
            "Error-free operation",
            "Listing accuracy",
            "Property quality",
            "Property safety",
            "Owner or user conduct",
            "Rental results",
            "Availability of rooms or seats",
            "Suitability for an individual user",
            "Third-party services",
            "Results based on recommendations or filters",
          ]}
        />
        <p>
          Users make property and rental decisions at their own discretion after
          completing independent checks.
        </p>
      </LegalSection>

      <LegalSection title="21. Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law, CampusStay will not
          be liable for losses arising from:
        </p>
        <LegalList
          items={[
            "Rental disputes",
            "Deposit or refund disputes",
            "Financial loss",
            "Payment fraud",
            "Property damage",
            "Theft",
            "Personal injury",
            "Food or service quality",
            "Owner, manager, tenant, or visitor conduct",
            "Incorrect or outdated listing information",
            "Decisions made using platform information",
            "Unauthorised account use caused by failure to secure credentials",
            "Data loss",
            "Technical interruption",
            "Third-party links or services",
            "Events outside CampusStay's reasonable control",
          ]}
        />
        <p>
          Nothing in these Terms excludes liability that cannot legally be
          excluded under applicable law.
        </p>
      </LegalSection>

      <LegalSection title="22. User Responsibility for Violations">
        <p>
          A user may be responsible for losses, complaints, claims, or legal
          costs caused by:
        </p>
        <LegalList
          items={[
            "Their unlawful activity",
            "Their fraudulent or misleading content",
            "Their violation of these Terms",
            "Their violation of another person's rights",
            "Their unauthorised use of CampusStay information",
          ]}
        />
        <p>
          CampusStay may take reasonable steps to protect itself and affected
          users where such conduct occurs.
        </p>
      </LegalSection>

      <LegalSection title="23. Changes to These Terms">
        <p>
          CampusStay may update these Terms periodically to reflect:
        </p>
        <LegalList
          items={[
            "Changes to the platform",
            "New features",
            "Business changes",
            "Safety or security requirements",
            "Legal or regulatory requirements",
          ]}
        />
        <p>
          The updated version will be published on this page with a revised Last
          Updated date and version number.
        </p>
        <p>
          Where a material update affects existing users, CampusStay may provide
          additional notice or request renewed acceptance.
        </p>
        <p>
          Continued use of CampusStay after updated Terms become effective
          constitutes acceptance of the revised Terms, subject to applicable
          legal requirements.
        </p>
      </LegalSection>

      <LegalSection title="24. Governing Law and Jurisdiction">
        <p>These Terms are governed and interpreted according to the laws of India.</p>
        <p>
          Subject to applicable law, disputes arising from or relating to
          CampusStay or these Terms will be subject to the jurisdiction of
          competent courts located in Assam, India.
        </p>
      </LegalSection>

      <LegalSection title="25. Contact Us">
        <p>
          Questions, concerns, complaints, or legal notices regarding these Terms
          may be sent to:
        </p>
        <LegalContactBlock />
        <p>
          CampusStay will make reasonable efforts to respond to legitimate
          inquiries in a timely manner.
        </p>
      </LegalSection>
    </LegalDocumentPage>
  );
}

export default Terms;