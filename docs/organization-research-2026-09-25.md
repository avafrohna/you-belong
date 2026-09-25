# Organization source check

Reviewed September 25, 2026. This is a research record, not a published directory.
Official sources establish identity and a San Diego connection; they do not
establish that every organization is small, independently operated, or a business.
Most entries are nonprofits, community groups, faith centers, or local chapters.
No events have been imported or invented during this review.

Follow-on profiles, category assignments and upcoming-event findings are in
[Community profiles and event research](community-profiles-and-events.md), with
structured records in `community-content-2026-09-25.json`.

## Identified San Diego organizations

Descriptions below summarize the organizations' own accounts of their work.

| Supplied name | Public name and official source | Local connection and work |
| --- | --- | --- |
| san diego foundation | [San Diego Foundation](https://www.sdfoundation.org/about-us/) | San Diego-based regional community foundation supporting charitable giving, grants, scholarships and community partnerships. A major regional foundation, not a small business; included at the user’s explicit request. |
| media arts center san diego | [Media Arts Center San Diego](https://mediaartscenter.org/home/about-us/) | Local arts nonprofit supporting media education, community storytelling and film exhibition through programs including Digital Gym Cinema and the San Diego Latino Film Festival. Added at the user’s request. |
| actavist san diego | [Activist San Diego](https://www.activistsandiego.org/about/) | San Diego social-justice organization connecting volunteers, community organizations, and grassroots efforts through media, education, and organizing. Its [Contact page](https://www.activistsandiego.org/contact/) lists a San Diego mailing address. |
| humanization matters | [The Humanization Matters Collaborative](https://humanizationmatters.org/about-us/) | Works on dignity and equity through healthcare, education, and media, including consulting, strategic planning, and community partnerships. User personally confirmed on September 25, 2026 that this new organization is run in San Diego. Local operation is owner-confirmed rather than independently established from the website. |
| Alliance SD | [Alliance San Diego](https://www.alliancesd.org/ourstory/) | San Diego community organization working on human rights, civic participation, and community power. Its work also reaches beyond San Diego. |
| SD organizing project | [San Diego Organizing Project](https://sdop.net/) | Faith-based community organizing across San Diego County. |
| pathways to citizenship | [Pathways to Citizenship](https://pathwayssd.org/) | Immigration legal assistance and citizenship education serving San Diego County. |
| wac | [San Diego World Affairs Council](https://www.sdwac.org/) | Local global-affairs education and discussion organization; affiliated with World Affairs Councils of America. User confirmed this expansion. |
| hop | [House of Palestine](https://houseofpalestine.org/about-us/) | Palestinian cultural organization in Balboa Park, within the House of Pacific Relations network. User confirmed this expansion. |
| karama | [KARAMA](https://karamanow.org/) | San Diego organization providing education and cultural programming about the Arab and Islamic worlds, including Palestinian issues. The [San Diego Arab Film Festival](https://sandiegoaff.org/) is a KARAMA project. |
| ICSD | [Islamic Center of San Diego](https://www.icsd.org/icsd.html) | San Diego mosque and community center providing religious, educational, and community programs. Do not describe its size as small without evidence. |
| pana | [Partnership for the Advancement of New Americans](https://www.panasd.org/opportunities/) | San Diego nonprofit working on refugee inclusion, community leadership, and advocacy. Its policy work also extends beyond the city. |
| just education collective | [JUST Education Collective](https://www.justeducationcollective.com/) | San Diego County grassroots education collective focused on equity, mutual aid, and advocacy. |
| border angels | [Border Angels](https://www.borderangels.org/about-us.html) | San Diego-based migrant and refugee rights organization providing humanitarian support in the border region. |
| kind hearts san diego | [Kind Hearts San Diego](https://www.kindheartssd.org/about) | La Mesa-based organization supporting refugees and newcomers through community assistance and resources. |
| sister cities | [San Diego International Sister Cities Association (SanDISCA)](https://www.sandisca.org/) | Local umbrella association supporting international sister-city and friendship-city societies. User confirmed this organization. |
| pacific houses | [House of Pacific Relations International Cottages](https://www.sdhpr.org/) | Balboa Park cultural umbrella organization. User confirmed the umbrella listing. House of Palestine is also listed separately; shared events must not be duplicated. |
| san diego refugees coalition | [San Diego Refugee Communities Coalition](https://sandiegorefugeecommunities.org/about-us/) | Coalition of local refugee-serving community organizations. User confirmed the corrected full name. |

## Identified local chapters or offices

These have identifiable local operations, but should not be presented as
independent small San Diego companies.

| Supplied name | Local listing and official source | Organization type |
| --- | --- | --- |
| cair | [CAIR California — San Diego](https://ca.cair.com/sandiego/) | Local office in a larger civil-rights organization. |
| jvp | [Jewish Voice for Peace San Diego](https://www.jvpsandiego.org/) | Local chapter of a national Palestinian-rights advocacy organization. |
| PCRF | [Palestine Children's Relief Fund — San Diego](https://www.pcrf.net/team/san-diego.html) | Local chapter of a larger humanitarian charity. |
| irc | [International Rescue Committee in San Diego](https://www.rescue.org/united-states/san-diego-ca) | Local office of an international humanitarian organization, supporting refugees and immigrants. |

## Confirmed identity with broader geographic scope

| Supplied name | Confirmed organization | Local connection and remaining limits |
| --- | --- | --- |
| HEAL | [HEAL Palestine](https://www.healpalestine.org/events/) | User confirmed the identity. Its official events page has advertised San Diego events. Describe it as a broader humanitarian organization with local activity; an independent San Diego organization or formal chapter has not been established. |

## Outside the stated local scope; decision pending

| Supplied name | Result | Follow-up |
| --- | --- | --- |
| acacia center for justice | [Acacia Center for Justice](https://acaciajustice.org/contact-us/) is headquartered in Washington, D.C. and operates a national immigration legal-services network. | Not an independent local San Diego company. Confirm whether national resources are wanted, or identify the particular local partner/program intended. |

Humanization Matters website check: standard HTTPS requests to both the apex and
www host failed with an expired-certificate error on September 25, 2026. HTTP
redirected to HTTPS and encountered the same error. Public homepage, About,
Leadership, and Contact text was readable using a diagnostic request without
certificate verification; normal secure access was **not** verified. The supplied
domain identifies the intended organization. The user subsequently confirmed
its San Diego operation firsthand; no further location confirmation is needed. Do not use template contact links as verified contact information.

## User exclusions and deduplication

- **Kasey's group:** user confirmed this means JUST Education Collective. Keep one listing.
- **Spark San Diego:** leave out at the user's request; no intended website provided.
- **SJP:** leave out at the user's request; no campus chapter selected.
- **San Diego Community Coalition:** leave out at the user's request.

## Website and calendar use

- Use organization names and local chapter/office labels accurately; do not label
  this entire collection as businesses or imply a formal partnership with You Belong.
- Suggested section assignments are editorial decisions to make from each verified
  mission. These groups should not all be placed in Businesses That Give Back.
- Keep uncertain candidates out of public profiles until their identities are resolved.
- Real organization data belongs in `src/data/organizations.js`, separate from the
  fictional business previews. Shared real event data belongs in `src/data/events.js`.
- Organization verification does not verify any particular event. Before publishing
  an event, check its current organizer page, date, time, timezone, venue, and source.
- Candidate event sources already found include [Activist San Diego](https://www.activistsandiego.org/),
  [World Affairs Council](https://www.sdwac.org/),
  [SanDISCA](https://www.sandisca.org/events-calendar/),
  [House of Pacific Relations](https://www.sdhpr.org/),
  [JVP San Diego](https://www.jvpsandiego.org/), and
  [IRC San Diego](https://www.rescue.org/united-states/san-diego-ca).
  These are source candidates, not implemented feeds or verified event records.
