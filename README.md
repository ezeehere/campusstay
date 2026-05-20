Create this file in your project root:

```text
README.md
```

Paste this full content:

````md
# CampusStay

CampusStay is a web app that helps students find verified PGs and rooms near campus.

The first launch area is **JIST**, with future expansion planned for **JEC** and then wider **Jorhat**.

> Find verified PGs and rooms near campus - made easy for students.

---

## Preview

Add screenshots here after deployment.

```md
![CampusStay Home](./screenshots/home.png)
![CampusStay Admin](./screenshots/admin.png)
````

---

## What CampusStay does

CampusStay helps students and parents quickly check:

* PG and room listings near campus
* Rent, deposit, area, and distance
* Food availability
* Room type
* Facilities and rules
* Photos of the stay
* Direct call and WhatsApp contact
* Listing verification status

It also allows PG owners to submit their listing for review.

---

## Main Features

### Public Panel

* View approved PG and room listings
* Search listings
* Filter by gender, type, food, availability, and verification
* View full listing details
* Call or WhatsApp the owner
* Submit a new PG or room listing
* Check listing status using Tracking ID and phone number

### Owner Listing Flow

1. Owner submits listing details
2. Images are uploaded to Cloudinary
3. Listing is saved in Firebase Firestore
4. Listing stays under review
5. Owner receives a Tracking ID
6. Owner can check status anytime

### Admin Panel

* Firebase Auth based admin login
* Protected admin dashboard
* View all submitted listings
* Approve or unapprove listings
* Mark listings as verified
* Mark listings as full or available
* Delete listings
* View complete listing details
* Set owner-facing status
* Add admin notes for corrections

---

## Tech Stack

| Part           | Technology         |
| -------------- | ------------------ |
| Frontend       | React + Vite       |
| Styling        | Tailwind CSS       |
| Routing        | React Router       |
| Database       | Firebase Firestore |
| Authentication | Firebase Auth      |
| Image Uploads  | Cloudinary         |
| Hosting        | Vercel             |
| Icons          | Lucide React       |

---

## Project Structure

```text
campusstay
  public

  src
    cloudinary
      uploadImages.js

    components
      admin
        AdminListingDetailsModal.jsx
        ProtectedAdminRoute.jsx

      common
        Badge.jsx

      public
        ListingCard.jsx
        ListingDetailsModal.jsx
        SubmitListingForm.jsx

    firebase
      auth.js
      config.js
      listings.js

    pages
      admin
        AdminDashboard.jsx
        AdminLogin.jsx

      public
        CheckStatus.jsx
        Home.jsx
        SubmitListing.jsx

    utils
      whatsapp.js

    App.jsx
    index.css
    main.jsx

  .env
  .gitignore
  package.json
  README.md
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

Do not push `.env` to GitHub.

Make sure `.gitignore` includes:

```gitignore
node_modules
dist
.env
.env.local
```

---

## Firebase Setup

### 1. Create Firebase project

Create a Firebase project and add a web app.

### 2. Enable Firestore

Create a Firestore database.

### 3. Enable Firebase Auth

Enable Email/Password login.

### 4. Create admin user

Create an admin user inside:

```text
Firebase Authentication -> Users
```

### 5. Add admin UID

Create this collection in Firestore:

```text
admins
```

Create a document where the document ID is the admin user's Firebase UID.

Example:

```text
admins
  ADMIN_UID_HERE
    email: admin@example.com
    role: admin
```

---

## Firestore Rules

Use rules similar to this:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn()
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    match /listings/{listingId} {
      allow read: if resource.data.approved == true || isAdmin();

      allow create: if
        request.resource.data.approved == false
        && request.resource.data.verified == false
        && request.resource.data.available == true;

      allow update, delete: if isAdmin();
    }

    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## Cloudinary Setup

Create an unsigned upload preset in Cloudinary.

Suggested preset:

```text
campusstay_unsigned
```

Suggested folder:

```text
campusstay/listings
```

Add these values in `.env`:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=campusstay_unsigned
```

---

## Local Setup

Clone the project:

```bash
git clone https://github.com/YOUR_USERNAME/campusstay.git
```

Go inside the folder:

```bash
cd campusstay
```

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## Build

Create production build:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

---

## Routes

| Route              | Purpose                   |
| ------------------ | ------------------------- |
| `/`                | Public homepage           |
| `/submit-listing`  | Submit PG or room listing |
| `/check-status`    | Check listing status      |
| `/admin/login`     | Admin login               |
| `/admin/dashboard` | Protected admin dashboard |

---

## Current Status

CampusStay MVP includes:

* Public listing page
* Listing details modal
* Submit listing page
* Cloudinary image upload
* Firebase Firestore storage
* Owner tracking system
* Admin login
* Protected admin dashboard
* Listing approval system
* Status check system

---

## Planned Improvements

* Edit listing from admin panel
* Better owner communication flow
* Featured listings
* Report listing system
* College selector for JIST and JEC
* PWA install support
* Custom domain
* Better SEO setup
* More listing filters
* Analytics for listing views and contact clicks

---

## First Launch Plan

CampusStay will launch first for:

```text
JIST
```

Then expand to:

```text
JEC
```

Then:

```text
Jorhat-wide student stays
```

---

## Author

**Ezaz Ahmed Khan**
Student at Jorhat Institute of Science and Technology
Project: CampusStay

````

After adding it, run:

```bash
git add README.md
git commit -m "Add README"
git push
````
