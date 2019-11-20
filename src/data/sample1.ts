import * as Store from "../store/index";

export default [
  {
    id: "4s62btq9",
    name: "Emma",
    problems: [
      {
        assessment: [] as Store.Note[],
        problem: {
          id: "12",
          scope: 0,
          severity: 2,
          signsAndSymptoms: [
            { id: "03" },
            { id: "13" },
            { id: "14" },
            { id: "15" },
            { id: "09" },
            { id: "17" },
            { id: "18" },
            { id: "22" }
          ],
          otherSignsAndSymptoms: "",
          details: "",
          isHighPriority: true
        },
        interventions: [
          {
            category: { id: "01" },
            target: { id: "28" },
            details: [
              {
                text: "angefangen eine therapeutische Beziehung aufzubauen",
                createdAt: new Date("2019-06-11")
              }
            ],
            startedAt: new Date("2019-06-11"),
            endedAt: undefined
          },
          {
            category: { id: "01" },
            target: { id: "49" },
            details: [
              {
                text: "Symptome überprüft",
                createdAt: new Date("2019-06-11")
              }
            ],
            startedAt: new Date("2019-06-11"),
            endedAt: undefined
          },
          {
            category: { id: "03" },
            target: { id: "31" },
            details: [
              {
                text: "Termin zur Einschätzung geplant",
                createdAt: new Date("2019-06-11")
              }
            ],
            startedAt: new Date("2019-06-11"),
            endedAt: undefined
          },
          {
            category: { id: "04" },
            target: { id: "49" },
            details: [
              {
                text:
                  "Aktivität, Stimmungsschwankungen, Halluzinationen und Pflegeberichte",
                createdAt: new Date("2019-06-11")
              }
            ],
            startedAt: new Date("2019-06-11"),
            endedAt: undefined
          }
        ],
        outcomes: [
          {
            knowledge: {
              observation: 2,
              expectation: 4,
              comment: "anhaltende Symptome störten Realitätswahrnehmung"
            },
            behaviour: {
              observation: 2,
              expectation: 4,
              comment:
                "hörte selten auf zu suchen und zu hetzen, aber aß und schlief"
            },
            status: {
              observation: 2,
              expectation: 4,
              comment: "Unruhe, beschrieb Wahnvorstellungen und Halluzinationen"
            },
            personRatedInPlaceOfOwner: "",
            createdAt: new Date("2019-06-11")
          },
          {
            status: { observation: 2, expectation: 4, comment: "" },
            knowledge: { observation: 2, expectation: 4, comment: "" },
            behaviour: { observation: 2, expectation: 4, comment: "" },
            personRatedInPlaceOfOwner: "",
            createdAt: new Date("2019-07-09")
          },
          {
            status: { observation: 2, expectation: 4, comment: "" },
            knowledge: { observation: 3, expectation: 4, comment: "" },
            behaviour: { observation: 2, expectation: 4, comment: "" },
            personRatedInPlaceOfOwner: "",
            createdAt: new Date("2019-08-06")
          },
          {
            status: { observation: 2, expectation: 4, comment: "" },
            knowledge: { observation: 3, expectation: 4, comment: "" },
            behaviour: { observation: 3, expectation: 4, comment: "" },
            personRatedInPlaceOfOwner: "",
            createdAt: new Date("2019-09-03")
          },
          {
            status: { observation: 3, expectation: 4, comment: "" },
            knowledge: { observation: 4, expectation: 4, comment: "" },
            behaviour: { observation: 3, expectation: 4, comment: "" },
            personRatedInPlaceOfOwner: "",
            createdAt: new Date("2019-10-01")
          },
          {
            status: { observation: 3, expectation: 4, comment: "" },
            knowledge: { observation: 4, expectation: 4, comment: "" },
            behaviour: { observation: 4, expectation: 4, comment: "" },
            personRatedInPlaceOfOwner: "",
            createdAt: new Date("2019-10-29")
          }
        ],
        createdAt: new Date("2019-06-11"),
        resolvedAt: undefined,
        ratingIntervalInDays: 28
      }
    ],
    createdAt: new Date("2019-06-11")
  }
] as Store.Customer[];
