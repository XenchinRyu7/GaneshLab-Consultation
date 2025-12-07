import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Ganeshlab Consultation",
  version: packageJson.version,
  copyright: `© ${currentYear}, Ganeshlab Consultation.`,
  meta: {
    title: "Ganeshlab Consultation - Appointments & Project Management Dashboard",
    description:
      "Ganeshlab Consultation is a comprehensive platform for managing appointments and projects seamlessly.",
  },
};
