
# Count It

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
![Platforms](https://img.shields.io/badge/Platform-Web-blue.svg)

**Count It** is a full-stack web app built with SvelteKit and Supabase, enabling users to easily manage invoices, customers, products, and inventory. It utilizes TypeScript and Supabase-generated types for end-to-end type safety, integrates Zod for form validation, and uses Shadcn-UI for a modern, accessible design.

## Screenshots

![Invoices page](https://res.cloudinary.com/dnwasepdv/image/upload/w_2048/v1741931861/git/count-it/invoices_nvnyeq.png)

![Customers page](https://res.cloudinary.com/dnwasepdv/image/upload/w_2048/v1741936517/git/count-it/customers_bikkvv.png)

![Activity Report page](https://res.cloudinary.com/dnwasepdv/image/upload/w_2048/v1741937662/git/count-it/activity_report_hikugb.png)


## Features

- 🌍 Fully responsive design
- 🌗 Light/dark mode support
- 🔑 Role-based access control
- 📑 Generate customer statements and activity reports
- 🖨️ Print reports and invoices directly from the interface


## Run Locally

Clone the project

```bash
git clone https://github.com/rejoytm/count-it
```

Go to the project directory

```bash
cd count-it
```

Install dependencies

```bash
npm install
```

Start the server

```bash
npm run start
```


## Environment Variables

To run this project, you will need to define the following environment variables in a `.env` file:

```
PUBLIC_SUPABASE_URL=<your-supabase-url>
PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Make sure to replace the placeholders with your Supabase project details.
