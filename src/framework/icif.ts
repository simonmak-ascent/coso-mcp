import type { IcfFramework, Principle } from './types.js';

/**
 * COSO Internal Control—Integrated Framework (ICIF-2013).
 *
 * The 5 components, 17 principle statements and objective categories reproduce
 * public framework wording. Points of focus are **paraphrased, illustrative
 * summaries** — a subset, not exhaustive, and not COSO text. Verify against the
 * licensed framework before use in an audit file.
 */
export const ICIF: IcfFramework = {
  id: 'coso-icif-2013',
  label: 'COSO Internal Control—Integrated Framework (ICIF-2013)',
  version: '2013',
  sourceUrl: 'https://www.coso.org/guidance-on-ic',
  notice:
    'Principles and component/objective statements reproduce public COSO framework wording. Points of focus are paraphrased, illustrative summaries — a non-exhaustive subset, not COSO text. Verify against the licensed framework before use in audit documentation.',

  components: [
    {
      id: 'control-environment',
      number: 1,
      name: 'Control Environment',
      summary:
        'The set of standards, processes and structures that provide the basis for carrying out internal control across the organization.',
      principles: [1, 2, 3, 4, 5]
    },
    {
      id: 'risk-assessment',
      number: 2,
      name: 'Risk Assessment',
      summary:
        'A dynamic and iterative process for identifying and assessing risks to the achievement of objectives.',
      principles: [6, 7, 8, 9]
    },
    {
      id: 'control-activities',
      number: 3,
      name: 'Control Activities',
      summary:
        'The actions established through policies and procedures that help ensure management’s directives to mitigate risks are carried out.',
      principles: [10, 11, 12]
    },
    {
      id: 'information-communication',
      number: 4,
      name: 'Information and Communication',
      summary:
        'The ongoing generation and use of relevant information, and the internal and external communication needed to support internal control.',
      principles: [13, 14, 15]
    },
    {
      id: 'monitoring-activities',
      number: 5,
      name: 'Monitoring Activities',
      summary:
        'Ongoing and separate evaluations to ascertain whether the components of internal control are present and functioning, and communication of deficiencies.',
      principles: [16, 17]
    }
  ],

  principles: [
    {
      number: 1,
      id: 'integrity-and-ethical-values',
      component: 'control-environment',
      statement:
        'The organization demonstrates a commitment to integrity and ethical values.',
      pointsOfFocus: [
        { id: 'tone-at-the-top', summary: 'Sets a tone at the top that supports internal control.' },
        { id: 'standards-of-conduct', summary: 'Establishes standards of conduct.' },
        { id: 'evaluates-adherence', summary: 'Evaluates adherence to standards of conduct.' },
        { id: 'addresses-deviations', summary: 'Addresses deviations in a timely manner.' }
      ]
    },
    {
      number: 2,
      id: 'board-independence-and-oversight',
      component: 'control-environment',
      statement:
        'The board of directors demonstrates independence from management and exercises oversight of the development and performance of internal control.',
      pointsOfFocus: [
        { id: 'establishes-oversight', summary: 'Establishes oversight responsibilities.' },
        { id: 'applies-expertise', summary: 'Applies relevant expertise and independence.' },
        { id: 'operates-independently', summary: 'Operates independently and provides oversight.' },
        { id: 'provides-oversight', summary: 'Provides oversight of the system of internal control.' }
      ]
    },
    {
      number: 3,
      id: 'structures-authorities-responsibilities',
      component: 'control-environment',
      statement:
        'Management establishes, with board oversight, structures, reporting lines, and appropriate authorities and responsibilities in the pursuit of objectives.',
      pointsOfFocus: [
        { id: 'considers-structures', summary: 'Considers all structures of the entity.' },
        { id: 'establishes-reporting-lines', summary: 'Establishes reporting lines.' },
        { id: 'defines-authorities', summary: 'Defines, assigns and limits authorities and responsibilities.' }
      ]
    },
    {
      number: 4,
      id: 'commitment-to-competence',
      component: 'control-environment',
      statement:
        'The organization demonstrates a commitment to attract, develop, and retain competent individuals in alignment with objectives.',
      pointsOfFocus: [
        { id: 'policies-and-practices', summary: 'Establishes policies and practices for human capital.' },
        { id: 'evaluates-competence', summary: 'Evaluates competence and addresses shortfalls.' },
        { id: 'plans-succession', summary: 'Plans for and prepares for succession.' }
      ]
    },
    {
      number: 5,
      id: 'accountability',
      component: 'control-environment',
      statement:
        'The organization holds individuals accountable for their internal control responsibilities in the pursuit of objectives.',
      pointsOfFocus: [
        { id: 'enforces-accountability', summary: 'Enforces accountability through structures, authorities and responsibilities.' },
        { id: 'alignment-of-incentives', summary: 'Aligns incentives and rewards with internal control responsibility.' },
        { id: 'evaluates-performance', summary: 'Evaluates performance and rewards or disciplines appropriately.' }
      ]
    },
    {
      number: 6,
      id: 'specifies-objectives',
      component: 'risk-assessment',
      statement:
        'The organization specifies objectives with sufficient clarity to enable the identification and assessment of risks relating to objectives.',
      pointsOfFocus: [
        { id: 'operational-objectives', summary: 'Reflects operational objectives.' },
        { id: 'external-reporting-objectives', summary: 'Reflects external financial and non-financial reporting objectives.' },
        { id: 'internal-reporting-objectives', summary: 'Reflects internal reporting objectives.' },
        { id: 'compliance-objectives', summary: 'Reflects compliance objectives.' },
        { id: 'objective-clarity', summary: 'Defines objectives with sufficient clarity.' }
      ]
    },
    {
      number: 7,
      id: 'identifies-and-analyzes-risk',
      component: 'risk-assessment',
      statement:
        'The organization identifies risks to the achievement of its objectives across the entity and analyzes risks as a basis for determining how the risks should be managed.',
      pointsOfFocus: [
        { id: 'includes-entity-level', summary: 'Includes entity, subsidiary, division, operating unit and functional levels.' },
        { id: 'analyzes-inherent-risk', summary: 'Analyzes inherent risks.' },
        { id: 'assesses-likelihood-and-impact', summary: 'Assesses likelihood and impact.' },
        { id: 'identifies-risk-response', summary: 'Determines risk responses and whether to accept, avoid, reduce or share risk.' }
      ]
    },
    {
      number: 8,
      id: 'considers-fraud',
      component: 'risk-assessment',
      statement:
        'The organization considers the potential for fraud in assessing risks to the achievement of objectives.',
      pointsOfFocus: [
        { id: 'fraud-risk-assessment', summary: 'Considers various types of fraud and incentives/pressures.' },
        { id: 'fraud-risk-factors', summary: 'Assesses opportunities for fraud and attitudes/rationalizations.' }
      ]
    },
    {
      number: 9,
      id: 'identifies-changes',
      component: 'risk-assessment',
      statement:
        'The organization identifies and assesses changes that could significantly impact the system of internal control.',
      pointsOfFocus: [
        { id: 'external-environment-changes', summary: 'Assesses changes in the external environment.' },
        { id: 'business-model-changes', summary: 'Assesses changes in the business model.' },
        { id: 'leadership-changes', summary: 'Assesses changes in leadership.' }
      ]
    },
    {
      number: 10,
      id: 'selects-and-develops-control-activities',
      component: 'control-activities',
      statement:
        'The organization selects and develops control activities that contribute to the mitigation of risks to the achievement of objectives to acceptable levels.',
      pointsOfFocus: [
        { id: 'integrates-with-risk-assessment', summary: 'Integrates with risk assessment.' },
        { id: 'considers-entity-specific-factors', summary: 'Considers entity-specific factors.' },
        { id: 'determines-relevant-business-processes', summary: 'Determines relevant business processes.' },
        { id: 'evaluates-mix-of-control-activities', summary: 'Evaluates a mix of control activity types.' },
        { id: 'considers-levels-of-entity', summary: 'Considers at what level activities are applied.' },
        { id: 'addresses-segregation-of-duties', summary: 'Addresses segregation of duties.' }
      ]
    },
    {
      number: 11,
      id: 'general-controls-over-technology',
      component: 'control-activities',
      statement:
        'The organization selects and develops general control activities over technology to support the achievement of objectives.',
      pointsOfFocus: [
        { id: 'determines-technology-dependence', summary: 'Determines the dependence of the entity’s processes on technology.' },
        { id: 'establishes-technology-infrastructure', summary: 'Establishes relevant technology infrastructure controls.' },
        { id: 'establishes-security-management', summary: 'Establishes relevant security management controls.' },
        { id: 'establishes-technology-acquisition', summary: 'Establishes relevant technology acquisition, development and maintenance controls.' }
      ]
    },
    {
      number: 12,
      id: 'deploys-through-policies-and-procedures',
      component: 'control-activities',
      statement:
        'The organization deploys control activities through policies that establish what is expected and procedures that put policies into action.',
      pointsOfFocus: [
        { id: 'establishes-policies-and-procedures', summary: 'Establishes policies and procedures to support deployment of management’s directives.' },
        { id: 'establishes-responsibility-accountability', summary: 'Establishes responsibility and accountability for executing policies and procedures.' },
        { id: 'performs-competently', summary: 'Performs in a timely manner and takes corrective action.' },
        { id: 'performs-using-competent-personnel', summary: 'Performs using competent personnel.' },
        { id: 'reassesses-policies-and-procedures', summary: 'Reassesses policies and procedures.' }
      ]
    },
    {
      number: 13,
      id: 'obtains-and-uses-information',
      component: 'information-communication',
      statement:
        'The organization obtains or generates and uses relevant, quality information to support the functioning of internal control.',
      pointsOfFocus: [
        { id: 'identifies-information-requirements', summary: 'Identifies information requirements.' },
        { id: 'captures-internal-and-external-sources', summary: 'Captures internal and external sources of data.' },
        { id: 'processes-relevant-data', summary: 'Processes relevant data into information.' },
        { id: 'maintains-quality', summary: 'Maintains quality throughout processing.' },
        { id: 'considers-cost-benefit', summary: 'Considers the cost of information relative to benefit.' }
      ]
    },
    {
      number: 14,
      id: 'communicates-internally',
      component: 'information-communication',
      statement:
        'The organization internally communicates information, including objectives and responsibilities for internal control, necessary to support the functioning of internal control.',
      pointsOfFocus: [
        { id: 'communicates-internal-control-information', summary: 'Communicates internal control information.' },
        { id: 'communicates-with-the-board', summary: 'Communicates with the board of directors.' },
        { id: 'provides-separate-lines-of-communication', summary: 'Provides separate communication lines.' },
        { id: 'selects-relevant-methods', summary: 'Selects relevant methods of communication.' }
      ]
    },
    {
      number: 15,
      id: 'communicates-externally',
      component: 'information-communication',
      statement:
        'The organization communicates with external parties regarding matters affecting the functioning of internal control.',
      pointsOfFocus: [
        { id: 'communicates-to-external-parties', summary: 'Communicates to external parties.' },
        { id: 'enables-inbound-communication', summary: 'Enables inbound communication.' },
        { id: 'communicates-with-the-board', summary: 'Communicates with the board of directors.' },
        { id: 'selects-relevant-methods', summary: 'Selects relevant methods of communication.' }
      ]
    },
    {
      number: 16,
      id: 'performs-evaluations',
      component: 'monitoring-activities',
      statement:
        'The organization selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning.',
      pointsOfFocus: [
        { id: 'considers-ongoing-and-separate-evaluations', summary: 'Considers a mix of ongoing and separate evaluations.' },
        { id: 'considers-rate-of-change', summary: 'Considers the rate of change.' },
        { id: 'establishes-baseline-understanding', summary: 'Establishes a baseline understanding of internal control.' },
        { id: 'uses-knowledgeable-personnel', summary: 'Uses knowledgeable personnel.' },
        { id: 'integrates-with-business-processes', summary: 'Integrates with business processes.' },
        { id: 'adjusts-scope-and-frequency', summary: 'Adjusts scope and frequency.' },
        { id: 'objectively-evaluates', summary: 'Objectively evaluates.' }
      ]
    },
    {
      number: 17,
      id: 'evaluates-and-communicates-deficiencies',
      component: 'monitoring-activities',
      statement:
        'The organization evaluates and communicates internal control deficiencies in a timely manner to those parties responsible for taking corrective action, including senior management and the board of directors, as appropriate.',
      pointsOfFocus: [
        { id: 'assesses-results', summary: 'Assesses results of ongoing and separate evaluations.' },
        { id: 'communicates-deficiencies', summary: 'Communicates deficiencies.' },
        { id: 'monitors-corrective-actions', summary: 'Monitors corrective actions.' }
      ]
    }
  ],

  objectiveCategories: [
    {
      id: 'operations',
      name: 'Operations',
      summary:
        'Effectiveness and efficiency of operations, including operational and financial performance goals and safeguarding of assets.'
    },
    {
      id: 'reporting',
      name: 'Reporting',
      summary:
        'Internal and external financial and non-financial reporting, encompassing reliability, timeliness and transparency.'
    },
    {
      id: 'compliance',
      name: 'Compliance',
      summary: 'Adherence to laws and regulations to which the entity is subject.'
    }
  ]
};

/** All 17 principles, ordered by framework number. */
export function allPrinciples(): Principle[] {
  return ICIF.principles;
}
