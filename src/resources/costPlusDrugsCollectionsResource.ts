/**
 * Cost Plus Drugs Collections Resource
 * Provides access to medication collections/categories from Cost Plus Drugs API
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResourceMetadata } from "../types/mcp.js";
import { getApiClient } from "../services/apiClient.js";
import type { ProcessedCollection } from "../types/api.js";

// Static collections data from the API
const COLLECTIONS_DATA: ProcessedCollection[] = [
  { id: "Q29sbGVjdGlvbjox", name: "All Medications", slug: "all-medications" },
  { id: "Q29sbGVjdGlvbjoy", name: "Acid Reflux", slug: "acid-reflux" },
  { id: "Q29sbGVjdGlvbjo0", name: "Alcohol Dependence", slug: "alcohol-dependence" },
  { id: "Q29sbGVjdGlvbjo1", name: "Allergies", slug: "allergies" },
  { id: "Q29sbGVjdGlvbjo2", name: "ALS", slug: "als" },
  { id: "Q29sbGVjdGlvbjo3", name: "Angina", slug: "angina" },
  { id: "Q29sbGVjdGlvbjo4", name: "Anti-bacterial", slug: "anti-bacterial" },
  { id: "Q29sbGVjdGlvbjo5", name: "Anti-fungal", slug: "anti-fungal" },
  { id: "Q29sbGVjdGlvbjoxMA==", name: "Antihyperlipidemic", slug: "antihyperlipidemic" },
  { id: "Q29sbGVjdGlvbjoxMQ==", name: "Anti-Inflammation", slug: "anti-inflammation" },
  { id: "Q29sbGVjdGlvbjoxMg==", name: "Antimalarial", slug: "antimalarial" },
  { id: "Q29sbGVjdGlvbjoxMw==", name: "Anti-Parasitic", slug: "anti-parasitic" },
  { id: "Q29sbGVjdGlvbjoxNA==", name: "Anti-viral", slug: "anti-viral" },
  { id: "Q29sbGVjdGlvbjoxNQ==", name: "Arrhythmia", slug: "arrhythmia" },
  { id: "Q29sbGVjdGlvbjoxNg==", name: "Arthritis", slug: "arthritis" },
  { id: "Q29sbGVjdGlvbjoxNw==", name: "Asthma/COPD", slug: "asthma/copd" },
  { id: "Q29sbGVjdGlvbjoxOA==", name: "Birth Control", slug: "birth-control" },
  { id: "Q29sbGVjdGlvbjoxOQ==", name: "Blood Thinner", slug: "blood-thinner" },
  { id: "Q29sbGVjdGlvbjoyMA==", name: "Bone Health", slug: "bone-health" },
  { id: "Q29sbGVjdGlvbjoyMQ==", name: "Breast Cancer", slug: "breast-cancer" },
  { id: "Q29sbGVjdGlvbjoyMg==", name: "Burns", slug: "burns" },
  { id: "Q29sbGVjdGlvbjoyMw==", name: "Cancer", slug: "cancer" },
  { id: "Q29sbGVjdGlvbjoyNA==", name: "Chronic Dry Eye", slug: "chronic-dry-eye" },
  { id: "Q29sbGVjdGlvbjoyNQ==", name: "Colonoscopy Preparation", slug: "colonoscopy-preparation" },
  { id: "Q29sbGVjdGlvbjoyNg==", name: "Constipation", slug: "constipation" },
  { id: "Q29sbGVjdGlvbjoyNw==", name: "Cough", slug: "cough" },
  { id: "Q29sbGVjdGlvbjoyOA==", name: "Crohn's Disease", slug: "crohn's-disease" },
  { id: "Q29sbGVjdGlvbjoyOQ==", name: "Dementia", slug: "dementia" },
  { id: "Q29sbGVjdGlvbjozMA==", name: "Dental Care", slug: "dental-care" },
  { id: "Q29sbGVjdGlvbjozMQ==", name: "Diabetes", slug: "diabetes" },
  { id: "Q29sbGVjdGlvbjozMg==", name: "Diuretic", slug: "diuretic" },
  { id: "Q29sbGVjdGlvbjozMw==", name: "Endometriosis", slug: "endometriosis" },
  { id: "Q29sbGVjdGlvbjozNA==", name: "Erectile Dysfunction", slug: "erectile-dysfunction" },
  { id: "Q29sbGVjdGlvbjozNQ==", name: "Eye Health", slug: "eye-health" },
  { id: "Q29sbGVjdGlvbjozNg==", name: "Fertility", slug: "fertility" },
  { id: "Q29sbGVjdGlvbjozNw==", name: "Gallstone", slug: "gallstone" },
  { id: "Q29sbGVjdGlvbjozOA==", name: "Gastrointestinal", slug: "gastrointestinal" },
  { id: "Q29sbGVjdGlvbjozOQ==", name: "Glaucoma", slug: "glaucoma" },
  { id: "Q29sbGVjdGlvbjo0MA==", name: "Gout", slug: "gout" },
  { id: "Q29sbGVjdGlvbjo0MQ==", name: "Hair & Skin Health", slug: "hair-&-skin-health" },
  { id: "Q29sbGVjdGlvbjo0Mg==", name: "Heart Failure", slug: "heart-failure" },
  { id: "Q29sbGVjdGlvbjo0Mw==", name: "Heart Health", slug: "heart-health" },
  { id: "Q29sbGVjdGlvbjo0NA==", name: "Hemorrhage", slug: "hemorrhage" },
  { id: "Q29sbGVjdGlvbjo0NQ==", name: "Hemorrhoids", slug: "hemorrhoids" },
  { id: "Q29sbGVjdGlvbjo0Ng==", name: "High Blood Pressure", slug: "high-blood-pressure" },
  { id: "Q29sbGVjdGlvbjo0Nw==", name: "High Cholesterol", slug: "high-cholesterol" },
  { id: "Q29sbGVjdGlvbjo0OA==", name: "High Potassium", slug: "high-potassium" },
  { id: "Q29sbGVjdGlvbjo0OQ==", name: "HIV", slug: "hiv" },
  { id: "Q29sbGVjdGlvbjo1MA==", name: "Hormone Therapy", slug: "hormone-therapy" },
  { id: "Q29sbGVjdGlvbjo1MQ==", name: "Huntington's Disease", slug: "huntington's-disease" },
  { id: "Q29sbGVjdGlvbjo1Mg==", name: "Hyponatremia", slug: "hyponatremia" },
  { id: "Q29sbGVjdGlvbjo1Mw==", name: "Incontinence", slug: "incontinence" },
  { id: "Q29sbGVjdGlvbjo1NA==", name: "Infection", slug: "infection" },
  { id: "Q29sbGVjdGlvbjo1NQ==", name: "Insomnia", slug: "insomnia" },
  { id: "Q29sbGVjdGlvbjo1Ng==", name: "Iron Overload", slug: "iron-overload" },
  { id: "Q29sbGVjdGlvbjo1Nw==", name: "Kidney Disease", slug: "kidney-disease" },
  { id: "Q29sbGVjdGlvbjo1OA==", name: "Leukemia", slug: "leukemia" },
  { id: "Q29sbGVjdGlvbjo1OQ==", name: "Low Blood Pressure", slug: "low-blood-pressure" },
  { id: "Q29sbGVjdGlvbjo2MA==", name: "Low Blood Sugar", slug: "low-blood-sugar" },
  { id: "Q29sbGVjdGlvbjo2MQ==", name: "Low Potassium", slug: "low-potassium" },
  { id: "Q29sbGVjdGlvbjo2Mg==", name: "Men's Health", slug: "men's-health" },
  { id: "Q29sbGVjdGlvbjo2Mw==", name: "Mental Health", slug: "mental-health" },
  { id: "Q29sbGVjdGlvbjo2NA==", name: "Migraines", slug: "migraines" },
  { id: "Q29sbGVjdGlvbjo2NQ==", name: "Multiple sclerosis", slug: "multiple-sclerosis" },
  { id: "Q29sbGVjdGlvbjo2Ng==", name: "Muscle Relaxants", slug: "muscle-relaxants" },
  { id: "Q29sbGVjdGlvbjo2Nw==", name: "Musculoskeletal", slug: "musculoskeletal" },
  { id: "Q29sbGVjdGlvbjo2OA==", name: "Nausea", slug: "nausea" },
  { id: "Q29sbGVjdGlvbjo2OQ==", name: "Neurological", slug: "neurological" },
  { id: "Q29sbGVjdGlvbjo3MA==", name: "Opioid Dependence", slug: "opioid-dependence" },
  { id: "Q29sbGVjdGlvbjo3MQ==", name: "Oral Health", slug: "oral-health" },
  { id: "Q29sbGVjdGlvbjo3Mg==", name: "Organ Transplant", slug: "organ-transplant" },
  { id: "Q29sbGVjdGlvbjo3Mw==", name: "Overactive Bladder", slug: "overactive-bladder" },
  { id: "Q29sbGVjdGlvbjo3NA==", name: "Pain & Inflammation", slug: "pain-&-inflammation" },
  { id: "Q29sbGVjdGlvbjo3NQ==", name: "Pain & Nausea", slug: "pain-&-nausea" },
  { id: "Q29sbGVjdGlvbjo3Ng==", name: "Parkinson's Disease", slug: "parkinson's-disease" },
  { id: "Q29sbGVjdGlvbjo3Nw==", name: "Phenylketonuria", slug: "phenylketonuria" },
  { id: "Q29sbGVjdGlvbjo3OA==", name: "Prostate", slug: "prostate" },
  { id: "Q29sbGVjdGlvbjo3OQ==", name: "Pulmonary Fibrosis", slug: "pulmonary-fibrosis" },
  { id: "Q29sbGVjdGlvbjo4MA==", name: "Restless Leg Syndrome", slug: "restless-leg-syndrome" },
  { id: "Q29sbGVjdGlvbjo4MQ==", name: "Rheumatoid Arthritis", slug: "rheumatoid-arthritis" },
  { id: "Q29sbGVjdGlvbjo4Mg==", name: "Seizures", slug: "seizures" },
  { id: "Q29sbGVjdGlvbjo4Mw==", name: "Sleep Aid", slug: "sleep-aid" },
  { id: "Q29sbGVjdGlvbjo4NA==", name: "Smoking Cessation", slug: "smoking-cessation" },
  { id: "Q29sbGVjdGlvbjo4NQ==", name: "Steroid", slug: "steroid" },
  { id: "Q29sbGVjdGlvbjo4Ng==", name: "Stroke Prevention", slug: "stroke-prevention" },
  { id: "Q29sbGVjdGlvbjo4Nw==", name: "Thrombocytopenia", slug: "thrombocytopenia" },
  { id: "Q29sbGVjdGlvbjo4OA==", name: "Thyroid", slug: "thyroid" },
  { id: "Q29sbGVjdGlvbjo4OQ==", name: "Urea Cycle Disorders", slug: "urea-cycle-disorders" },
  { id: "Q29sbGVjdGlvbjo5MA==", name: "Urinary Symptoms", slug: "urinary-symptoms" },
  { id: "Q29sbGVjdGlvbjo5MQ==", name: "Vascular Disease", slug: "vascular-disease" },
  { id: "Q29sbGVjdGlvbjo5Mg==", name: "Vitamin Deficiency", slug: "vitamin-deficiency" },
  { id: "Q29sbGVjdGlvbjo5Mw==", name: "Weight Management", slug: "weight-management" },
  { id: "Q29sbGVjdGlvbjo5NA==", name: "Wilson Disease", slug: "wilson-disease" },
  { id: "Q29sbGVjdGlvbjo5NQ==", name: "Women's Health", slug: "women's-health" },
];

// Define a Zod schema for collection items
export const CollectionSchema = z.object({
  id: z.string().describe("Unique identifier for the collection"),
  name: z.string().describe("Name of the medication collection"),
  slug: z.string().describe("URL-friendly slug for the collection"),
});

export const CollectionsArraySchema = z.array(CollectionSchema);

// ===== RESOURCE REGISTRATION =====

export function registerCostPlusDrugsCollectionsResource(server: McpServer): void {
  const resourceName = "cost_plus_drugs_collections";
  const resourceUri = "cost-plus-drugs://collections";

  const resourceConfig: ResourceMetadata = {
    title: "Cost Plus Drugs Medication Collections",
    description: `Comprehensive list of medication categories available on Cost Plus Drugs.\n\n**Purpose:** Browse all available medication categories to understand what types of medications are offered.\n\n**Data:** Contains ${COLLECTIONS_DATA.length} medication collections including categories like Diabetes, Heart Health, Mental Health, Cancer, etc.\n\n**Usage:** Use this resource to:\n- Discover available medication categories\n- Find specific collections by name or ID\n- Understand the scope of medications available\n\n**Note:** These collections represent the main categories of medications available through Cost Plus Drugs pharmacy services.`,
    schema: CollectionsArraySchema,
  };

  const resourceFetcher = async (uri: URL) => {
    // Extract query parameter from the URI if needed
    const query = uri.searchParams.get('query');
    let filteredData = COLLECTIONS_DATA;

    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      filteredData = COLLECTIONS_DATA.filter(collection =>
        collection.name.toLowerCase().includes(lowerCaseQuery) ||
        collection.slug.toLowerCase().includes(lowerCaseQuery)
      );
    }

    return {
      contents: filteredData.map(collection => ({
        uri: `cost-plus-drugs://collections/${collection.id}`,
        text: `ID: ${collection.id}\nName: ${collection.name}\nSlug: ${collection.slug}\nCategory: Medication Collection`,
        blob: '',
        _meta: collection,
      }))
    };
  };

  server.registerResource(
    resourceName,
    resourceUri,
    resourceConfig,
    resourceFetcher
  );
}
