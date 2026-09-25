# CDYLC / CLJSC 2028

Bilingual website for the Canadian Deaf Youth Leadership Camp / Camp de leadership des jeunes sourds du Canada, organized by Deaf Youth Canada / Jeunes Sourds du Canada.

## Hosting

This is a static website. No build command, package installation, server, or API key is required.

In **Settings → Pages**, use **Deploy from a branch**, select **main** and **/ (root)**, then save. The `.nojekyll` file lets GitHub publish the files directly.

## Editing

- The eight `.html` files are the website pages. Preserve both the English (`en`) and French (`fr`) content when updating text.
- `styles.css` contains shared styling, including the mobile layout.
- `site.js` handles language selection and navigation.
- `contact.js` handles contact-form validation and the confirmation display.
- `assets/board/` contains the board photographs. The current president image is `president-updated.png`.

Commit changes to `main` to update the published website. The camp year is 2028; dates, location, registration fees, and the application deadline remain to be announced.

## Contact form

The form posts to FormSubmit and sends inquiries to **dycjsc@gmail.com**. FormSubmit requires recipient activation; confirm its activation email after the first submission if this inbox is not already activated. Delivery has not been verified as part of this migration.

The form return URL follows the current website address when JavaScript is enabled. If the repository name or domain changes, also update the fallback `_next` and `_url` values in `contact.html`.

The privacy policy describes GitHub Pages hosting, Google Fonts, FormSubmit, and browser language preferences.

© 2026 Deaf Youth Canada / Jeunes Sourds du Canada. All rights reserved. / Tous droits réservés.
