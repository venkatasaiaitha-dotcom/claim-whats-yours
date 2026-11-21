/*
  SCHEME RULES = DATA. Edit this file (or use the Admin tab in the app) when rules change.
  IMPORTANT: this is SAMPLE data written for a hackathon demo. last_verified is null on purpose:
  check every rule against the official portal, then set the date. Nothing here is guaranteed.
  Rule ops: eq | in | lte | gte.  Rule fields must exist in "fields" below.
*/
globalThis.SCHEME_DATA = {
  "fields": {
    "state": {
      "label": "State of residence",
      "rule_label": "Family lives in",
      "type": "choice",
      "options": ["Telangana", "Another state"],
      "question": "Which state does the student's family live in?"
    },
    "category": {
      "label": "Social category",
      "rule_label": "Social category",
      "type": "choice",
      "options": ["SC", "ST", "BC", "OC"],
      "option_labels": { "SC": "SC", "ST": "ST", "BC": "BC / OBC", "OC": "OC / EBC (general)" },
      "question": "Which social category does the family belong to?"
    },
    "minority": {
      "label": "Religious minority",
      "rule_label": "Belongs to a notified religious minority (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)",
      "type": "boolean",
      "question": "Does the family belong to a notified religious minority (Muslim, Christian, Sikh, Buddhist, Jain or Parsi)?"
    },
    "income": {
      "label": "Family income per year",
      "rule_label": "Total family income per year",
      "type": "money",
      "question": "What is the total yearly income of the whole family, in rupees? An approximate figure is fine."
    },
    "level": {
      "label": "Course level",
      "rule_label": "Current course level",
      "type": "choice",
      "options": ["intermediate", "diploma", "degree", "pg"],
      "option_labels": {
        "intermediate": "Intermediate / Class 11-12",
        "diploma": "Diploma / Polytechnic",
        "degree": "Degree (B.Tech, B.Sc, BA, B.Com...)",
        "pg": "Post-graduation (M.Tech, MBA, MA...)"
      },
      "question": "What is the student studying right now?"
    },
    "top20": {
      "label": "Top 20% in Class 12",
      "rule_label": "Scored in the top 20% of successful candidates in the Class 12 board exam",
      "type": "boolean",
      "question": "Did the student score in the top 20% of successful candidates in their Class 12 board exam?"
    },
    "disability40": {
      "label": "Disability 40% or more",
      "rule_label": "Has a disability of 40% or more",
      "type": "boolean",
      "question": "Does the student have a certified disability of 40% or more?"
    }
  },

  "document_guides": {
    "Income certificate": [
      "Go to a MeeSeva centre (or the MeeSeva online service) and choose the Income Certificate service.",
      "Carry proof of identity and address, a ration card or a similar family proof, and a salary or earnings proof if you have one.",
      "Fill in the form, pay the small service fee, and note the application number.",
      "The Tahsildar's office verifies it. Check the status with your application number.",
      "Collect or download the certificate. Make sure it is recent, since many portals ask for a new one each year."
    ],
    "Caste certificate": [
      "Go to a MeeSeva centre and choose the Caste Certificate service.",
      "Carry the parents' caste certificate or school records showing caste, plus identity and address proof.",
      "Fill in the form, pay the fee, and note the application number.",
      "The revenue office (Tahsildar) verifies it. Track the status with your application number.",
      "Collect or download the certificate and keep a few copies."
    ],
    "Caste (ST) certificate": [
      "Go to a MeeSeva centre and choose the Caste (ST) Certificate service.",
      "Carry the parents' ST certificate or school records showing caste, plus identity and address proof.",
      "Fill in the form, pay the fee, and note the application number.",
      "The revenue office verifies it. Track the status with your application number.",
      "Collect or download the certificate and keep a few copies."
    ],
    "Caste (BC) certificate": [
      "Go to a MeeSeva centre and choose the Caste (BC) Certificate service.",
      "Carry the parents' caste certificate or school records showing caste, plus identity and address proof.",
      "Fill in the form, pay the fee, and note the application number.",
      "The revenue office verifies it. Track the status with your application number.",
      "Collect or download the certificate and keep a few copies."
    ],
    "Bonafide / study certificate": [
      "Visit your college office or ask your class coordinator.",
      "Submit a short written request or the college's form, with your ID card or admission number.",
      "Ask for it to be signed and stamped by the principal or the authorised person.",
      "Check that your name, course, year and academic year are correct before you leave."
    ],
    "Bonafide / admission proof": [
      "Visit your college office or ask your class coordinator.",
      "Submit a short written request or the college's form, with your ID card or admission number.",
      "Ask for it to be signed and stamped by the principal or the authorised person.",
      "Check that your name, course and year are correct before you leave."
    ],
    "Previous marks memo": [
      "Look for your original or a copy of your last exam marks memo.",
      "If you cannot find it, ask your school or college office for a duplicate or a copy.",
      "Scan it clearly so all marks and your name are readable."
    ],
    "Class 12 marks memo": [
      "Look for your original or a copy of your Class 12 (Intermediate) marks memo.",
      "If you cannot find it, ask your junior college or the Board of Intermediate Education for a duplicate.",
      "Scan it clearly so all marks and your name are readable."
    ],
    "Bank passbook (first page)": [
      "Use a savings account in the student's own name. If you do not have one, ask your bank branch to open one.",
      "Check with your branch that the account is active and linked as the bank asks for scholarship payments.",
      "Scan or photograph the first page showing your name, account number and IFSC code. Do not share it anywhere except the official portal."
    ],
    "Passport-size photo": [
      "Get a recent passport-size photo at a photo studio.",
      "Ask for a soft copy as well as printed copies, because portals usually ask for an uploaded image."
    ],
    "Aadhaar card (carry the card itself; do not type the number anywhere in this app)": [
      "Keep your Aadhaar card, or download it from the official UIDAI website or app.",
      "Check that your name, date of birth and mobile number are correct. If they are wrong, get them updated before you apply.",
      "Only use it on the official scholarship portal when it asks. Never type the number into this app."
    ],
    "Disability certificate (40% or more)": [
      "Apply for or renew your disability certificate through the competent medical authority in your district (SADAREM in Telangana).",
      "Carry identity proof, address proof, passport photos and any earlier medical records.",
      "Attend the medical assessment on the date given.",
      "Collect the certificate and check that the disability percentage is clearly stated."
    ]
  },

  "schemes": [
    {
      "id": "epass-sc",
      "name": "Telangana ePASS Post-Matric Scholarship (SC)",
      "authority": "Telangana SC Development Department",
      "benefit": "Tuition fee reimbursement and maintenance allowance for post-matric courses",
      "url": "https://telanganaepass.cgg.gov.in",
      "last_verified": null,
      "deadline": null,
      "deadline_note": "Dates change every academic year. Check the notice on the ePASS portal.",
      "rules": [
        { "field": "state", "op": "eq", "value": "Telangana" },
        { "field": "category", "op": "eq", "value": "SC" },
        { "field": "income", "op": "lte", "value": 250000 },
        { "field": "level", "op": "in", "value": ["intermediate", "diploma", "degree", "pg"] }
      ],
      "documents": [
        { "name": "Income certificate", "where": "MeeSeva centre / Tahsildar office" },
        { "name": "Caste certificate", "where": "MeeSeva centre / Tahsildar office" },
        { "name": "Bonafide / study certificate", "where": "Your college office" },
        { "name": "Previous marks memo", "where": "Your school or college" },
        { "name": "Bank passbook (first page)", "where": "Your bank branch. Account in the student's name." },
        { "name": "Passport-size photo", "where": "Any photo studio" },
        { "name": "Aadhaar card (carry the card itself; do not type the number anywhere in this app)", "where": "You already have this" }
      ],
      "steps": [
        "Open the official ePASS portal and choose Fresh registration (or Renewal if you got it last year).",
        "Fill in your personal and course details exactly as on your certificates.",
        "Upload the documents from your checklist.",
        "Submit the form and save your application ID.",
        "Your college and the district welfare office verify it. Check progress on the portal's status page.",
        "If the status is stuck for 2 weeks, ask your college scholarship in-charge to check it."
      ]
    },
    {
      "id": "epass-st",
      "name": "Telangana ePASS Post-Matric Scholarship (ST)",
      "authority": "Telangana Tribal Welfare Department",
      "benefit": "Tuition fee reimbursement and maintenance allowance for post-matric courses",
      "url": "https://telanganaepass.cgg.gov.in",
      "last_verified": null,
      "deadline": null,
      "deadline_note": "Dates change every academic year. Check the notice on the ePASS portal.",
      "rules": [
        { "field": "state", "op": "eq", "value": "Telangana" },
        { "field": "category", "op": "eq", "value": "ST" },
        { "field": "income", "op": "lte", "value": 250000 },
        { "field": "level", "op": "in", "value": ["intermediate", "diploma", "degree", "pg"] }
      ],
      "documents": [
        { "name": "Income certificate", "where": "MeeSeva centre / Tahsildar office" },
        { "name": "Caste (ST) certificate", "where": "MeeSeva centre / Tahsildar office" },
        { "name": "Bonafide / study certificate", "where": "Your college office" },
        { "name": "Previous marks memo", "where": "Your school or college" },
        { "name": "Bank passbook (first page)", "where": "Your bank branch" },
        { "name": "Passport-size photo", "where": "Any photo studio" }
      ],
      "steps": [
        "Open the official ePASS portal and choose Fresh registration (or Renewal).",
        "Fill in personal and course details exactly as on your certificates.",
        "Upload the documents from your checklist.",
        "Submit and save your application ID.",
        "Track verification on the portal status page; follow up with your college if it stalls."
      ]
    },
    {
      "id": "epass-bc",
      "name": "Telangana ePASS Post-Matric Scholarship (BC)",
      "authority": "Telangana BC Welfare Department",
      "benefit": "Tuition fee reimbursement and maintenance allowance for post-matric courses",
      "url": "https://telanganaepass.cgg.gov.in",
      "last_verified": null,
      "deadline": null,
      "deadline_note": "Dates change every academic year. Check the notice on the ePASS portal.",
      "rules": [
        { "field": "state", "op": "eq", "value": "Telangana" },
        { "field": "category", "op": "eq", "value": "BC" },
        { "field": "income", "op": "lte", "value": 200000 },
        { "field": "level", "op": "in", "value": ["intermediate", "diploma", "degree", "pg"] }
      ],
      "documents": [
        { "name": "Income certificate", "where": "MeeSeva centre / Tahsildar office" },
        { "name": "Caste (BC) certificate", "where": "MeeSeva centre / Tahsildar office" },
        { "name": "Bonafide / study certificate", "where": "Your college office" },
        { "name": "Previous marks memo", "where": "Your school or college" },
        { "name": "Bank passbook (first page)", "where": "Your bank branch" },
        { "name": "Passport-size photo", "where": "Any photo studio" }
      ],
      "steps": [
        "Open the official ePASS portal and choose Fresh registration (or Renewal).",
        "Fill in personal and course details exactly as on your certificates.",
        "Upload the documents from your checklist.",
        "Submit and save your application ID.",
        "Track verification on the portal status page; follow up with your college if it stalls."
      ]
    },
    {
      "id": "epass-ebc",
      "name": "Telangana ePASS Scholarship (EBC / OC families)",
      "authority": "Telangana BC Welfare Department (EBC cell)",
      "benefit": "Fee reimbursement for economically weaker students from OC families",
      "url": "https://telanganaepass.cgg.gov.in",
      "last_verified": null,
      "deadline": null,
      "deadline_note": "Dates change every academic year. Check the notice on the ePASS portal.",
      "rules": [
        { "field": "state", "op": "eq", "value": "Telangana" },
        { "field": "category", "op": "eq", "value": "OC" },
        { "field": "income", "op": "lte", "value": 100000 },
        { "field": "level", "op": "in", "value": ["intermediate", "diploma", "degree", "pg"] }
      ],
      "documents": [
        { "name": "Income certificate", "where": "MeeSeva centre / Tahsildar office" },
        { "name": "Bonafide / study certificate", "where": "Your college office" },
        { "name": "Previous marks memo", "where": "Your school or college" },
        { "name": "Bank passbook (first page)", "where": "Your bank branch" },
        { "name": "Passport-size photo", "where": "Any photo studio" }
      ],
      "steps": [
        "Open the official ePASS portal and choose Fresh registration (or Renewal).",
        "Fill in personal and course details exactly as on your certificates.",
        "Upload the documents from your checklist.",
        "Submit and save your application ID.",
        "Track verification on the portal status page."
      ]
    },
    {
      "id": "epass-minority",
      "name": "Telangana ePASS Minority Scholarship",
      "authority": "Telangana Minorities Welfare Department",
      "benefit": "Fee reimbursement and allowance for students from notified minority communities",
      "url": "https://telanganaepass.cgg.gov.in",
      "last_verified": null,
      "deadline": null,
      "deadline_note": "Dates change every academic year. Check the notice on the ePASS portal.",
      "rules": [
        { "field": "state", "op": "eq", "value": "Telangana" },
        { "field": "minority", "op": "eq", "value": true },
        { "field": "income", "op": "lte", "value": 200000 },
        { "field": "level", "op": "in", "value": ["intermediate", "diploma", "degree", "pg"] }
      ],
      "documents": [
        { "name": "Income certificate", "where": "MeeSeva centre / Tahsildar office" },
        { "name": "Bonafide / study certificate", "where": "Your college office" },
        { "name": "Previous marks memo", "where": "Your school or college" },
        { "name": "Bank passbook (first page)", "where": "Your bank branch" },
        { "name": "Passport-size photo", "where": "Any photo studio" }
      ],
      "steps": [
        "Open the official ePASS portal and choose Fresh registration (or Renewal).",
        "Select the minority scholarship option and fill in your details.",
        "Upload the documents from your checklist.",
        "Submit and save your application ID.",
        "Track verification on the portal status page."
      ]
    },
    {
      "id": "nsp-csss",
      "name": "Central Sector Scholarship Scheme for College Students (NSP)",
      "authority": "Ministry of Education, Government of India",
      "benefit": "Yearly scholarship for meritorious students from lower-income families in degree and PG courses",
      "url": "https://scholarships.gov.in",
      "last_verified": null,
      "deadline": null,
      "deadline_note": "Applications open once a year on the National Scholarship Portal. Check the portal for dates.",
      "rules": [
        { "field": "income", "op": "lte", "value": 450000 },
        { "field": "top20", "op": "eq", "value": true },
        { "field": "level", "op": "in", "value": ["degree", "pg"] }
      ],
      "documents": [
        { "name": "Class 12 marks memo", "where": "Your school or board" },
        { "name": "Income certificate", "where": "MeeSeva centre / Tahsildar office" },
        { "name": "Bonafide / admission proof", "where": "Your college office" },
        { "name": "Bank passbook (first page)", "where": "Your bank branch" },
        { "name": "Aadhaar card (carry the card itself; do not type the number anywhere in this app)", "where": "You already have this" }
      ],
      "steps": [
        "Go to the National Scholarship Portal and do the One Time Registration (OTR).",
        "Log in and fill the scholarship application.",
        "Upload your documents.",
        "Submit, then print or save the acknowledgement.",
        "Your institute and the state nodal officer verify the application. Check the status on the portal."
      ]
    },
    {
      "id": "nsp-pwd",
      "name": "Post-Matric Scholarship for Students with Disabilities (NSP)",
      "authority": "Department of Empowerment of Persons with Disabilities, Government of India",
      "benefit": "Maintenance allowance and fee support for students with 40% or more disability",
      "url": "https://scholarships.gov.in",
      "last_verified": null,
      "deadline": null,
      "deadline_note": "Applications open once a year on the National Scholarship Portal. Check the portal for dates.",
      "rules": [
        { "field": "disability40", "op": "eq", "value": true },
        { "field": "income", "op": "lte", "value": 250000 },
        { "field": "level", "op": "in", "value": ["intermediate", "diploma", "degree", "pg"] }
      ],
      "documents": [
        { "name": "Disability certificate (40% or more)", "where": "Issued by the competent medical authority (SADAREM in Telangana)" },
        { "name": "Income certificate", "where": "MeeSeva centre / Tahsildar office" },
        { "name": "Bonafide / admission proof", "where": "Your college office" },
        { "name": "Previous marks memo", "where": "Your school or college" },
        { "name": "Bank passbook (first page)", "where": "Your bank branch" }
      ],
      "steps": [
        "Go to the National Scholarship Portal and do the One Time Registration (OTR).",
        "Log in, pick the disability scholarship and fill the application.",
        "Upload your documents.",
        "Submit and save the acknowledgement.",
        "Your institute and the state nodal officer verify it. Track the status on the portal."
      ]
    }
  ]
};
