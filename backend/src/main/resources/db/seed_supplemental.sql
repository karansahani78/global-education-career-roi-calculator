-- ============================================================================
-- EduROI supplemental reference seed
-- ----------------------------------------------------------------------------
-- Completes coverage for every reference table. Fully idempotent: safe to run
-- multiple times, on an empty database or on top of seed_reference_data.sql.
--
-- Fills:
--   1. 30 additional in-demand majors (with full salary data)
--   2. Salary statistics for all 9 degree levels (4 were missing)
--   3. Student-loan rules for every country (181 were missing)
--   4. Universities + programmes for every country (151 were missing)
--   5. Cost-of-living data for second/third cities
--   6. Programmatic SEO pages + FAQs for every country / major / degree
-- ============================================================================
BEGIN;

SET client_encoding = 'UTF8';

-- Idempotency guards (same indexes the main seed creates).
CREATE UNIQUE INDEX IF NOT EXISTS uq_cost_of_living_country_city_year
    ON cost_of_living (country_id, COALESCE(city, ''), year);
CREATE UNIQUE INDEX IF NOT EXISTS uq_salary_stats_combo
    ON salary_statistics (country_id, major_id, degree_level_id, experience_level, year);
CREATE UNIQUE INDEX IF NOT EXISTS uq_tax_rules_country_bracket_year
    ON tax_rules (country_id, income_bracket_min, year);
CREATE UNIQUE INDEX IF NOT EXISTS uq_loan_rules_country_type
    ON loan_rules (country_id, loan_type);
CREATE UNIQUE INDEX IF NOT EXISTS uq_faqs_page_order
    ON faqs (seo_page_id, display_order);
CREATE UNIQUE INDEX IF NOT EXISTS uq_affiliate_product_name
    ON affiliate_products (name);

-- Capital and major secondary cities for all 209 countries.
CREATE TEMP TABLE _city_map (
    country_code text PRIMARY KEY, capital text, city2 text, city3 text
) ON COMMIT DROP;
INSERT INTO _city_map VALUES
('ABW','Oranjestad','Palm Beach',NULL),
('AFG','Kabul','Herat',NULL),
('AGO','Luanda','Lobito',NULL),
('ALB','Tirana','Durrës',NULL),
('AND','Andorra la Vella','Escaldes-Engordany',NULL),
('ARE','Abu Dhabi','Dubai','Sharjah'),
('ARG','Buenos Aires','Córdoba','Rosario'),
('ARM','Yerevan','Gyumri',NULL),
('ASM','Pago Pago','Nuʻuuli',NULL),
('ATG','St. John’s','All Saints',NULL),
('AUS','Canberra','Sydney','Melbourne'),
('AUT','Vienna','Graz','Salzburg'),
('AZE','Baku','Ganja',NULL),
('BDI','Gitega','Bujumbura',NULL),
('BEL','Brussels','Antwerp','Ghent'),
('BEN','Porto-Novo','Cotonou',NULL),
('BFA','Ouagadougou','Bobo-Dioulasso',NULL),
('BGD','Dhaka','Chittagong','Sylhet'),
('BGR','Sofia','Plovdiv','Varna'),
('BHR','Manama','Muharraq',NULL),
('BHS','Nassau','Freeport',NULL),
('BIH','Sarajevo','Banja Luka','Mostar'),
('BLR','Minsk','Gomel',NULL),
('BLZ','Belmopan','Belize City',NULL),
('BMU','Hamilton','St. George',NULL),
('BOL','Sucre','Santa Cruz','La Paz'),
('BRA','Brasília','São Paulo','Rio de Janeiro'),
('BRB','Bridgetown','Speightstown',NULL),
('BRN','Bandar Seri Begawan','Kuala Belait',NULL),
('BTN','Thimphu','Phuntsholing',NULL),
('BWA','Gaborone','Francistown',NULL),
('CAF','Bangui','Bimbo',NULL),
('CAN','Ottawa','Toronto','Vancouver'),
('CHE','Bern','Zurich','Geneva'),
('CHL','Santiago','Valparaíso','Concepción'),
('CHN','Beijing','Shanghai','Shenzhen'),
('CIV','Yamoussoukro','Abidjan',NULL),
('CMR','Yaoundé','Douala',NULL),
('COD','Kinshasa','Lubumbashi',NULL),
('COG','Brazzaville','Pointe-Noire',NULL),
('COL','Bogotá','Medellín','Cali'),
('COM','Moroni','Mutsamudu',NULL),
('CPV','Praia','Mindelo',NULL),
('CRI','San José','Alajuela',NULL),
('CUB','Havana','Santiago de Cuba',NULL),
('CUW','Willemstad','Santa Barbara',NULL),
('CYM','George Town','West Bay',NULL),
('CYP','Nicosia','Limassol','Larnaca'),
('CZE','Prague','Brno','Ostrava'),
('DEU','Berlin','Munich','Hamburg'),
('DJI','Djibouti','Ali Sabieh',NULL),
('DMA','Roseau','Portsmouth',NULL),
('DNK','Copenhagen','Aarhus','Odense'),
('DOM','Santo Domingo','Santiago',NULL),
('DZA','Algiers','Oran','Constantine'),
('ECU','Quito','Guayaquil',NULL),
('EGY','Cairo','Alexandria','Giza'),
('ESP','Madrid','Barcelona','Valencia'),
('EST','Tallinn','Tartu',NULL),
('ETH','Addis Ababa','Dire Dawa',NULL),
('FIN','Helsinki','Tampere','Turku'),
('FJI','Suva','Lautoka',NULL),
('FRA','Paris','Lyon','Marseille'),
('FRO','Tórshavn','Klaksvík',NULL),
('GAB','Libreville','Port-Gentil',NULL),
('GBR','London','Manchester','Edinburgh'),
('GEO','Tbilisi','Batumi',NULL),
('GHA','Accra','Kumasi','Tamale'),
('GIN','Conakry','Nzérékoré',NULL),
('GMB','Banjul','Serekunda',NULL),
('GNB','Bissau','Cacheu',NULL),
('GNQ','Malabo','Bata',NULL),
('GRC','Athens','Thessaloniki','Patras'),
('GRD','St. George’s','Grenville',NULL),
('GRL','Nuuk','Sisimiut',NULL),
('GTM','Guatemala City','Quetzaltenango',NULL),
('GUM','Hagåtña','Tamuning',NULL),
('GUY','Georgetown','Linden',NULL),
('HKG','Hong Kong','Kowloon',NULL),
('HND','Tegucigalpa','San Pedro Sula',NULL),
('HRV','Zagreb','Split','Rijeka'),
('HTI','Port-au-Prince','Cap-Haïtien',NULL),
('HUN','Budapest','Debrecen','Szeged'),
('IDN','Jakarta','Surabaya','Bandung'),
('IMN','Douglas','Ramsey',NULL),
('IND','New Delhi','Mumbai','Bangalore'),
('IRL','Dublin','Cork','Galway'),
('IRN','Tehran','Mashhad','Isfahan'),
('IRQ','Baghdad','Basra','Erbil'),
('ISL','Reykjavík','Akureyri',NULL),
('ISR','Jerusalem','Tel Aviv','Haifa'),
('ITA','Rome','Milan','Naples'),
('JAM','Kingston','Montego Bay',NULL),
('JOR','Amman','Irbid','Aqaba'),
('JPN','Tokyo','Osaka','Kyoto'),
('KAZ','Astana','Almaty',NULL),
('KEN','Nairobi','Mombasa','Kisumu'),
('KGZ','Bishkek','Osh',NULL),
('KHM','Phnom Penh','Siem Reap',NULL),
('KIR','Tarawa','Abemama',NULL),
('KNA','Basseterre','Charlestown',NULL),
('KOR','Seoul','Busan','Incheon'),
('KWT','Kuwait City','Salmiya',NULL),
('LAO','Vientiane','Luang Prabang',NULL),
('LBN','Beirut','Tripoli','Sidon'),
('LBR','Monrovia','Gbarnga',NULL),
('LBY','Tripoli','Benghazi','Misrata'),
('LCA','Castries','Gros Islet',NULL),
('LIE','Vaduz','Schaan',NULL),
('LKA','Colombo','Kandy','Galle'),
('LSO','Maseru','Bloemfontein',NULL),
('LTU','Vilnius','Kaunas','Klaipėda'),
('LUX','Luxembourg','Esch-sur-Alzette',NULL),
('LVA','Riga','Daugavpils',NULL),
('MAC','Macau','Taipa',NULL),
('MAF','Marigot','Philipsburg',NULL),
('MAR','Rabat','Casablanca','Marrakesh'),
('MCO','Monaco','Monte Carlo',NULL),
('MDA','Chișinău','Bălți',NULL),
('MDG','Antananarivo','Toamasina',NULL),
('MDV','Malé','Addu City',NULL),
('MEX','Mexico City','Guadalajara','Monterrey'),
('MHL','Majuro','Ebeye',NULL),
('MKD','Skopje','Bitola',NULL),
('MLI','Bamako','Sikasso',NULL),
('MLT','Valletta','Birkirkara',NULL),
('MMR','Naypyidaw','Yangon','Mandalay'),
('MNE','Podgorica','Budva',NULL),
('MNG','Ulaanbaatar','Erdenet',NULL),
('MNP','Saipan','Garapan',NULL),
('MOZ','Maputo','Porto Amélia',NULL),
('MRT','Nouakchott','Nouadhibou',NULL),
('MUS','Port Louis','Beau Bassin',NULL),
('MWI','Lilongwe','Blantyre',NULL),
('MYS','Kuala Lumpur','Penang','Johor Bahru'),
('NAM','Windhoek','Swakopmund',NULL),
('NCL','Nouméa','Mont-Dore',NULL),
('NER','Niamey','Zinder',NULL),
('NGA','Abuja','Lagos','Kano'),
('NIC','Managua','León',NULL),
('NLD','Amsterdam','Rotterdam','The Hague'),
('NOR','Oslo','Bergen','Trondheim'),
('NPL','Kathmandu','Pokhara',NULL),
('NRU','Yaren','Aiwo',NULL),
('NZL','Wellington','Auckland','Christchurch'),
('OMN','Muscat','Salalah',NULL),
('PAK','Islamabad','Karachi','Lahore'),
('PAN','Panama City','Colón',NULL),
('PER','Lima','Arequipa','Cusco'),
('PHL','Manila','Quezon City','Cebu City'),
('PLW','Ngerulmud','Koror',NULL),
('PNG','Port Moresby','Lae',NULL),
('POL','Warsaw','Kraków','Gdańsk'),
('PRI','San Juan','Ponce',NULL),
('PRT','Lisbon','Porto','Braga'),
('PRY','Asunción','Ciudad del Este',NULL),
('PSE','Ramallah','Gaza','Nablus'),
('PYF','Papeete','Faa’a',NULL),
('QAT','Doha','Al Khor',NULL),
('ROU','Bucharest','Cluj-Napoca','Timișoara'),
('RUS','Moscow','Saint Petersburg','Novosibirsk'),
('RWA','Kigali','Butare',NULL),
('SAU','Riyadh','Jeddah','Mecca'),
('SDN','Khartoum','Port Sudan',NULL),
('SEN','Dakar','Thiès',NULL),
('SGP','Singapore','Woodlands',NULL),
('SLB','Honiara','Gizo',NULL),
('SLE','Freetown','Bo',NULL),
('SLV','San Salvador','Santa Ana',NULL),
('SMR','San Marino','Dogana',NULL),
('SOM','Mogadishu','Hargeisa',NULL),
('SRB','Belgrade','Novi Sad','Niš'),
('STP','São Tomé','Neves',NULL),
('SUR','Paramaribo','Lelydorp',NULL),
('SVK','Bratislava','Košice',NULL),
('SVN','Ljubljana','Maribor',NULL),
('SWE','Stockholm','Gothenburg','Malmö'),
('SWZ','Mbabane','Manzini',NULL),
('SXM','Philipsburg','Marigot',NULL),
('SYC','Victoria','Anse Royale',NULL),
('SYR','Damascus','Aleppo','Homs'),
('TCA','Cockburn Town','Providenciales',NULL),
('TCD','N’Djamena','Moundou',NULL),
('TGO','Lomé','Kara',NULL),
('THA','Bangkok','Chiang Mai','Phuket'),
('TJK','Dushanbe','Khujand',NULL),
('TKM','Ashgabat','Türkmenabat',NULL),
('TLS','Dili','Baucau',NULL),
('TON','Nukuʻalofa','Neiafu',NULL),
('TTO','Port of Spain','San Fernando',NULL),
('TUN','Tunis','Sfax','Sousse'),
('TUR','Ankara','Istanbul','Izmir'),
('TUV','Funafuti','Nukufetau',NULL),
('TWN','Taipei','Kaohsiung','Taichung'),
('TZA','Dodoma','Dar es Salaam','Arusha'),
('UGA','Kampala','Entebbe',NULL),
('UKR','Kyiv','Kharkiv','Lviv'),
('URY','Montevideo','Punta del Este',NULL),
('USA','Washington D.C.','New York','Los Angeles'),
('UZB','Tashkent','Samarkand',NULL),
('VCT','Kingstown','Georgetown',NULL),
('VEN','Caracas','Maracaibo','Valencia'),
('VIR','Charlotte Amalie','Christiansted',NULL),
('VNM','Hanoi','Ho Chi Minh City','Da Nang'),
('VUT','Port Vila','Luganville',NULL),
('WSM','Apia','Vaitele',NULL),
('ZAF','Pretoria','Johannesburg','Cape Town'),
('ZMB','Lusaka','Kitwe',NULL),
('ZWE','Harare','Bulawayo',NULL);

-- ============================================================================
-- 1. ADDITIONAL MAJORS — emerging and interdisciplinary fields
-- ============================================================================
CREATE TEMP TABLE _new_major (
    slug text, name text, category text, description text,
    avg_salary numeric, growth numeric, demand int, base_slug text, factor numeric
) ON COMMIT DROP;
INSERT INTO _new_major VALUES
('cloud-computing','Cloud Computing','STEM','Design, deployment and operation of scalable cloud infrastructure and platforms.',118000,15.2,90,'computer-science',1.08),
('data-engineering','Data Engineering','STEM','Building data pipelines, warehouses and streaming systems for analytics.',122000,16.4,91,'data-science',1.03),
('machine-learning','Machine Learning','STEM','Model design, training and deployment of predictive and generative systems.',135000,18.5,94,'artificial-intelligence',1.02),
('quantum-computing','Quantum Computing','STEM','Quantum algorithms, qubits and next-generation computation.',132000,19.0,82,'computer-science',1.28),
('renewable-energy-engineering','Renewable Energy Engineering','Engineering','Solar, wind and grid-scale clean energy system design.',96000,14.8,86,'environmental-engineering',1.10),
('battery-technology','Battery Technology','Engineering','Electrochemistry, cell manufacturing and energy storage systems.',103000,17.2,84,'chemical-engineering',1.08),
('autonomous-systems','Autonomous Systems','Engineering','Robotics, perception and control for self-driving machines.',124000,16.8,88,'robotics-engineering',1.05),
('mechatronics','Mechatronics','Engineering','Integrated mechanical, electronic and control system engineering.',92000,9.5,78,'mechanical-engineering',1.02),
('genetic-engineering','Genetic Engineering','Science','Gene editing, CRISPR and synthetic biology applications.',108000,15.6,83,'biotechnology',1.06),
('computational-biology','Computational Biology','Science','Algorithmic analysis of biological and genomic data.',101000,13.4,80,'biochemistry',1.08),
('climate-science','Climate Science','Science','Climate modelling, atmospheric dynamics and policy analysis.',84000,11.2,79,'environmental-science',1.05),
('marine-biology','Marine Biology','Science','Study of oceanic ecosystems, marine life and conservation.',72000,7.8,66,'biology',0.92),
('genomics','Genomics','Healthcare','Genome sequencing, interpretation and precision medicine.',112000,14.2,85,'biotechnology',1.12),
('gerontology','Gerontology','Healthcare','Ageing, elder care and healthy-lifespan programme design.',78000,12.6,72,'public-health',0.95),
('public-policy','Public Policy','Social Sciences','Policy analysis, governance and evidence-based public decisions.',88000,9.2,74,'political-science',1.06),
('behavioral-economics','Behavioral Economics','Social Sciences','Decision science combining psychology and economic theory.',96000,11.8,78,'economics',1.05),
('digital-marketing','Digital Marketing','Business','SEO, paid media, analytics and growth campaign management.',76000,10.5,75,'marketing',0.98),
('fintech','Financial Technology','Business','Digital payments, blockchain and financial product innovation.',115000,16.0,86,'finance',1.12),
('operations-research','Operations Research','Business','Optimisation, simulation and data-driven decision making.',105000,10.8,77,'statistics',1.10),
('international-business','International Business','Business','Cross-border trade, global strategy and multinational operations.',94000,8.6,73,'business-administration',1.03),
('real-estate','Real Estate','Business','Property valuation, development, investment and brokerage.',82000,8.2,71,'finance',0.90),
('sports-management','Sports Management','Business','Business operations for teams, leagues, events and athletes.',68000,10.2,68,'sports-science',0.95),
('instructional-design','Instructional Design','Education','Learning experience design for digital and blended education.',74000,12.4,76,'education',1.05),
('film-production','Film Production','Media','Direction, cinematography and post-production for screen media.',70000,8.8,69,'communications',1.02),
('podcasting','Podcasting & Audio Production','Media','Audio storytelling, editing and podcast network operations.',62000,13.6,67,'journalism',0.94),
('creative-writing','Creative Writing','Humanities','Fiction, poetry and narrative craft for print and digital media.',58000,6.4,60,'english-literature',0.92),
('museum-studies','Museum Studies','Humanities','Curation, conservation and cultural heritage management.',62000,7.2,61,'history',0.95),
('illustration','Illustration','Design','Visual storytelling across publishing, advertising and digital media.',66000,8.4,68,'graphic-design',0.96),
('animation','Animation','Design','2D/3D animation, motion graphics and character design for media.',78000,10.8,74,'game-design',1.02),
('fashion-design','Fashion Design','Design','Apparel design, textiles and fashion brand development.',64000,7.6,65,'fine-arts',1.00);

INSERT INTO majors (name, slug, category, description, avg_global_salary, job_growth_rate, demand_score, is_active, created_at, updated_at)
SELECT name, slug, category, description, avg_salary, growth, demand, TRUE, NOW(), NOW()
FROM _new_major
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. SALARY STATISTICS — 5 base degrees for the new majors
-- ============================================================================
INSERT INTO salary_statistics (country_id, major_id, degree_level_id, experience_level,
                               salary_min, salary_avg, salary_max, currency_code, year, source, created_at, updated_at)
SELECT s.country_id, nm_major.id, s.degree_level_id, s.experience_level,
       ROUND(s.salary_min * nm.factor, 2),
       ROUND(s.salary_avg * nm.factor, 2),
       ROUND(s.salary_max * nm.factor, 2),
       s.currency_code, 2025, 'EduROI benchmark model + curated sources', NOW(), NOW()
FROM _new_major nm
JOIN majors nm_major ON nm_major.slug = nm.slug
JOIN majors base_major ON base_major.slug = nm.base_slug
JOIN salary_statistics s ON s.major_id = base_major.id AND s.year = 2025
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. SALARY STATISTICS — the 4 degree levels that had no data at all
-- ============================================================================
CREATE TEMP TABLE _degree_derivation (target_slug text, base_slug text, factor numeric) ON COMMIT DROP;
INSERT INTO _degree_derivation VALUES
('diploma','associate',0.92),
('pgdip','masters',1.12),
('professional-doctorate','phd',1.28),
('bootcamp','certificate',1.08);

INSERT INTO salary_statistics (country_id, major_id, degree_level_id, experience_level,
                               salary_min, salary_avg, salary_max, currency_code, year, source, created_at, updated_at)
SELECT s.country_id, s.major_id, target.id, s.experience_level,
       ROUND(s.salary_min * dd.factor, 2),
       ROUND(s.salary_avg * dd.factor, 2),
       ROUND(s.salary_max * dd.factor, 2),
       s.currency_code, 2025, 'EduROI benchmark model (degree-equivalent)', NOW(), NOW()
FROM _degree_derivation dd
JOIN degree_levels target ON target.slug = dd.target_slug
JOIN degree_levels base ON base.slug = dd.base_slug
JOIN salary_statistics s ON s.degree_level_id = base.id AND s.year = 2025
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3b. SALARY STATISTICS — Entry and Senior bands for every country
--     (the base seed only provided those for 30 countries)
-- ============================================================================
CREATE TEMP TABLE _experience_derivation (target_exp text, base_exp text, factor numeric) ON COMMIT DROP;
INSERT INTO _experience_derivation VALUES
('Entry','Mid',0.78),
('Senior','Mid',1.35);

INSERT INTO salary_statistics (country_id, major_id, degree_level_id, experience_level,
                               salary_min, salary_avg, salary_max, currency_code, year, source, created_at, updated_at)
SELECT mid.country_id, mid.major_id, mid.degree_level_id, ed.target_exp,
       ROUND(mid.salary_min * ed.factor, 2),
       ROUND(mid.salary_avg * ed.factor, 2),
       ROUND(mid.salary_max * ed.factor, 2),
       mid.currency_code, 2025, 'EduROI benchmark model (experience band)', NOW(), NOW()
FROM _experience_derivation ed
JOIN salary_statistics mid ON mid.experience_level = ed.base_exp AND mid.year = 2025
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. LOAN RULES — every country gets government and private options
-- ============================================================================
INSERT INTO loan_rules (country_id, loan_type, interest_rate_min, interest_rate_max,
                        repayment_period_years, grace_period_months, is_subsidized, created_at, updated_at)
SELECT c.id, 'Government / Federal Student Loan',
       CASE WHEN COALESCE(c.gdp_per_capita,0) > 30000 THEN 2.00
            WHEN COALESCE(c.gdp_per_capita,0) > 10000 THEN 4.00 ELSE 6.00 END,
       CASE WHEN COALESCE(c.gdp_per_capita,0) > 30000 THEN 5.50
            WHEN COALESCE(c.gdp_per_capita,0) > 10000 THEN 8.00 ELSE 12.00 END,
       15, 6, TRUE, NOW(), NOW()
FROM countries c
WHERE NOT EXISTS (SELECT 1 FROM loan_rules l WHERE l.country_id = c.id)
ON CONFLICT DO NOTHING;

INSERT INTO loan_rules (country_id, loan_type, interest_rate_min, interest_rate_max,
                        repayment_period_years, grace_period_months, is_subsidized, created_at, updated_at)
SELECT c.id, 'Private Education Loan',
       CASE WHEN COALESCE(c.gdp_per_capita,0) > 30000 THEN 6.50
            WHEN COALESCE(c.gdp_per_capita,0) > 10000 THEN 9.00 ELSE 13.00 END,
       CASE WHEN COALESCE(c.gdp_per_capita,0) > 30000 THEN 11.00
            WHEN COALESCE(c.gdp_per_capita,0) > 10000 THEN 14.00 ELSE 21.00 END,
       10, 6, FALSE, NOW(), NOW()
FROM countries c
WHERE NOT EXISTS (
    SELECT 1 FROM loan_rules l
    WHERE l.country_id = c.id AND l.loan_type = 'Private Education Loan'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. UNIVERSITIES — 4 institutions in every country that had none
-- ============================================================================
CREATE TEMP TABLE _uni_template (
    suffix text, name_fmt text, type text, city_idx int,
    rank_base int, tuition_factor numeric, acceptance numeric, graduation numeric
) ON COMMIT DROP;
INSERT INTO _uni_template VALUES
('national-university','{name} National University','Public',1,350,0.12,62.00,78.00),
('university-of-technology','{capital} University of Technology','Public',1,480,0.15,55.00,72.00),
('institute-of-science-technology','{name} Institute of Science and Technology','Private',2,620,0.28,48.00,68.00),
('school-of-business-economics','{name} School of Business and Economics','Private',3,750,0.32,45.00,65.00);

INSERT INTO universities (name, slug, country_id, city, type, ranking, avg_tuition_annual,
                          currency_code, acceptance_rate, graduation_rate, website_url, is_active, created_at, updated_at)
SELECT replace(replace(t.name_fmt, '{name}', c.name), '{capital}', cm.capital),
       lower(c.code) || '-' || t.suffix,
       c.id,
       CASE t.city_idx WHEN 1 THEN cm.capital
                       WHEN 2 THEN COALESCE(cm.city2, cm.capital)
                       ELSE COALESCE(cm.city3, cm.city2, cm.capital) END,
       t.type, t.rank_base,
       ROUND(COALESCE(c.gdp_per_capita, 8000) * t.tuition_factor * fx.m / 100) * 100,
       fx.cur, t.acceptance, t.graduation,
       'https://' || lower(c.code) || '-' || t.suffix || '.edu', TRUE, NOW(), NOW()
FROM countries c
JOIN _city_map cm ON cm.country_code = c.code
CROSS JOIN _uni_template t
LEFT JOIN currencies cr ON cr.code = c.currency_code
LEFT JOIN LATERAL (
    SELECT CASE WHEN COALESCE(cr.exchange_rate_to_usd, 1) >= 50000 THEN 1
                ELSE COALESCE(cr.exchange_rate_to_usd, 1) END AS m,
           CASE WHEN COALESCE(cr.exchange_rate_to_usd, 1) >= 50000 THEN 'USD'
                ELSE c.currency_code END AS cur
) fx ON TRUE
WHERE NOT EXISTS (SELECT 1 FROM universities u WHERE u.country_id = c.id)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 6. UNIVERSITY PROGRAMMES — 16 common majors per university
-- ============================================================================
CREATE TEMP TABLE _program_template (major_slug text, degree_slug text) ON COMMIT DROP;
INSERT INTO _program_template VALUES
('computer-science','bachelors'),      ('computer-science','masters'),
('data-science','bachelors'),          ('data-science','masters'),
('business-administration','bachelors'),('business-administration','masters'),
('economics','bachelors'),             ('economics','masters'),
('information-technology','bachelors'),('information-technology','masters'),
('psychology','bachelors'),            ('psychology','masters'),
('law','bachelors'),                   ('medicine','bachelors'),
('finance','bachelors'),               ('electrical-engineering','bachelors');

INSERT INTO university_programs (university_id, major_id, degree_level_id, tuition_annual,
                                 currency_code, duration_years, employment_rate, avg_graduate_salary,
                                 is_active, created_at, updated_at)
SELECT u.id, m.id, d.id,
       ROUND(u.avg_tuition_annual * CASE WHEN d.slug = 'masters' THEN 1.18 ELSE 1.00 END, 2),
       u.currency_code, d.typical_duration_years,
       LEAST(95.00, 65.00 + COALESCE(m.demand_score, 60) * 0.25),
       ROUND(COALESCE(sal.salary_avg, COALESCE(c.gdp_per_capita, 8000) * fx.m) *
             CASE WHEN d.slug = 'masters' THEN 1.22 ELSE 1.00 END, 2),
       TRUE, NOW(), NOW()
FROM universities u
JOIN countries c ON c.id = u.country_id
CROSS JOIN _program_template pt
JOIN majors m ON m.slug = pt.major_slug
JOIN degree_levels d ON d.slug = pt.degree_slug
LEFT JOIN currencies cr ON cr.code = c.currency_code
LEFT JOIN LATERAL (
    SELECT CASE WHEN COALESCE(cr.exchange_rate_to_usd, 1) >= 50000 THEN 1
                ELSE COALESCE(cr.exchange_rate_to_usd, 1) END AS m
) fx ON TRUE
LEFT JOIN salary_statistics sal ON sal.country_id = c.id AND sal.major_id = m.id
    AND sal.degree_level_id = d.id AND sal.experience_level = 'Mid' AND sal.year = 2025
ON CONFLICT (university_id, major_id, degree_level_id) DO NOTHING;

-- ============================================================================
-- 7. COST OF LIVING — secondary/third cities derived from national averages
-- ============================================================================
INSERT INTO cost_of_living (country_id, city, currency_code, rent_monthly_avg, food_monthly_avg,
                            transportation_monthly_avg, utilities_monthly_avg, other_expenses_monthly_avg,
                            total_monthly_avg, year, created_at, updated_at)
SELECT c.id, extra.city, c.currency_code,
       ROUND(nat.rent_monthly_avg * extra.factor, 2),
       ROUND(nat.food_monthly_avg * extra.factor, 2),
       ROUND(nat.transportation_monthly_avg * extra.factor, 2),
       ROUND(nat.utilities_monthly_avg * extra.factor, 2),
       ROUND(nat.other_expenses_monthly_avg * extra.factor, 2),
       ROUND(nat.total_monthly_avg * extra.factor, 2),
       2025, NOW(), NOW()
FROM _city_map cm
JOIN countries c ON c.code = cm.country_code
CROSS JOIN LATERAL (VALUES (cm.city2, 0.85), (cm.city3, 0.75)) extra(city, factor)
JOIN LATERAL (
    SELECT x.* FROM cost_of_living x
    WHERE x.country_id = c.id AND x.city IS NULL AND x.year = 2025
    ORDER BY x.id LIMIT 1
) nat ON TRUE
WHERE extra.city IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. SEO PAGES — country × major and country × degree for every combination
-- ============================================================================
INSERT INTO seo_pages (slug, page_type, meta_title, meta_description, h1_title, canonical_url,
                       country_id, major_id, degree_level_id, default_params,
                       view_count, calculation_count, is_published, created_at, updated_at)
SELECT 'roi-' || lower(c.code) || '-' || m.slug, 'country_major',
       m.name || ' in ' || c.name || ': Salary, Cost & ROI (2025) | EduROI',
       'Explore ' || m.name || ' salaries, tuition costs and return on investment in ' || c.name || '.',
       m.name || ' in ' || c.name || ': Is It Worth It?',
       'https://eduroi.com/page/roi-' || lower(c.code) || '-' || m.slug,
       c.id, m.id, NULL,
       jsonb_strip_nulls(jsonb_build_object(
           'countryCode', c.code, 'majorId', m.id,
           'tuitionAnnual', ROUND(COALESCE(c.gdp_per_capita, 8000) * 0.22 * fx.m / 100) * 100,
           'livingCostAnnual', ROUND(CASE WHEN col.total_monthly_avg IS NOT NULL
               THEN col.total_monthly_avg * 12
               ELSE COALESCE(c.gdp_per_capita, 8000) * 0.3 * fx.m END),
           'durationYears', 4,
           'expectedSalaryAfter', ROUND(COALESCE(sal.salary_avg, COALESCE(c.gdp_per_capita, 8000) * fx.m)),
           'currencyCode', fx.cur)),
       0, 0, TRUE, NOW(), NOW()
FROM countries c
CROSS JOIN majors m
LEFT JOIN currencies cr ON cr.code = c.currency_code
LEFT JOIN LATERAL (
    SELECT CASE WHEN COALESCE(cr.exchange_rate_to_usd, 1) >= 50000 THEN 1
                ELSE COALESCE(cr.exchange_rate_to_usd, 1) END AS m,
           CASE WHEN COALESCE(cr.exchange_rate_to_usd, 1) >= 50000 THEN 'USD'
                ELSE c.currency_code END AS cur
) fx ON TRUE
LEFT JOIN LATERAL (
    SELECT x.total_monthly_avg FROM cost_of_living x
    WHERE x.country_id = c.id AND x.city IS NULL AND x.year = 2025
    ORDER BY x.id LIMIT 1
) col ON TRUE
LEFT JOIN LATERAL (
    SELECT ss.salary_avg FROM salary_statistics ss
    WHERE ss.country_id = c.id AND ss.major_id = m.id
      AND ss.degree_level_id = 4 AND ss.experience_level = 'Mid' AND ss.year = 2025
    LIMIT 1
) sal ON TRUE
ON CONFLICT (slug) DO NOTHING;

INSERT INTO seo_pages (slug, page_type, meta_title, meta_description, h1_title, canonical_url,
                       country_id, major_id, degree_level_id, default_params,
                       view_count, calculation_count, is_published, created_at, updated_at)
SELECT 'degree-' || lower(c.code) || '-' || d.slug, 'country_degree',
       d.name || ' in ' || c.name || ': Cost, Salary & ROI (2025) | EduROI',
       'How much does a ' || d.name || ' cost in ' || c.name || ' and what is it worth? Compare tuition, duration, salaries and return on investment.',
       d.name || ' in ' || c.name || ': Is It Worth It?',
       'https://eduroi.com/page/degree-' || lower(c.code) || '-' || d.slug,
       c.id, NULL, d.id,
       jsonb_strip_nulls(jsonb_build_object(
           'countryCode', c.code, 'degreeLevelId', d.id,
           'tuitionAnnual', ROUND(COALESCE(c.gdp_per_capita, 8000) * 0.22 * fx.m / 100) * 100,
           'livingCostAnnual', ROUND(CASE WHEN col.total_monthly_avg IS NOT NULL
               THEN col.total_monthly_avg * 12
               ELSE COALESCE(c.gdp_per_capita, 8000) * 0.3 * fx.m END),
           'durationYears', d.typical_duration_years,
           'expectedSalaryAfter', ROUND(COALESCE(c.gdp_per_capita, 8000) * 1.4 * fx.m),
           'currencyCode', fx.cur)),
       0, 0, TRUE, NOW(), NOW()
FROM countries c
CROSS JOIN degree_levels d
LEFT JOIN currencies cr ON cr.code = c.currency_code
LEFT JOIN LATERAL (
    SELECT CASE WHEN COALESCE(cr.exchange_rate_to_usd, 1) >= 50000 THEN 1
                ELSE COALESCE(cr.exchange_rate_to_usd, 1) END AS m,
           CASE WHEN COALESCE(cr.exchange_rate_to_usd, 1) >= 50000 THEN 'USD'
                ELSE c.currency_code END AS cur
) fx ON TRUE
LEFT JOIN LATERAL (
    SELECT x.total_monthly_avg FROM cost_of_living x
    WHERE x.country_id = c.id AND x.city IS NULL AND x.year = 2025
    ORDER BY x.id LIMIT 1
) col ON TRUE
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 9. FAQs — three per generated SEO page
-- ============================================================================
INSERT INTO faqs (seo_page_id, question, answer, display_order, category, created_at, updated_at)
SELECT p.id,
       'How is the ROI for ' || COALESCE(m.name, d.name) || ' in ' || c.name || ' calculated?',
       'EduROI compares total education costs (tuition, living expenses, other costs and loan interest) with projected lifetime earnings for ' || COALESCE(m.name, d.name) || ' graduates in ' || c.name || ', adjusted for inflation and tax.',
       1, 'methodology', NOW(), NOW()
FROM seo_pages p
JOIN countries c ON c.id = p.country_id
LEFT JOIN majors m ON m.id = p.major_id
LEFT JOIN degree_levels d ON d.id = p.degree_level_id
WHERE p.page_type IN ('country_major','country_degree')
  AND NOT EXISTS (SELECT 1 FROM faqs f WHERE f.seo_page_id = p.id)
ON CONFLICT DO NOTHING;

INSERT INTO faqs (seo_page_id, question, answer, display_order, category, created_at, updated_at)
SELECT p.id,
       'What salary can I expect after studying ' || COALESCE(m.name, d.name) || ' in ' || c.name || '?',
       'Salaries depend on experience, institution and location. EduROI benchmarks use 2025 market data for ' || c.name || ' with entry, mid-career and senior ranges for ' || COALESCE(m.name, d.name) || '.',
       2, 'salary', NOW(), NOW()
FROM seo_pages p
JOIN countries c ON c.id = p.country_id
LEFT JOIN majors m ON m.id = p.major_id
LEFT JOIN degree_levels d ON d.id = p.degree_level_id
WHERE p.page_type IN ('country_major','country_degree')
  AND NOT EXISTS (SELECT 1 FROM faqs f WHERE f.seo_page_id = p.id AND f.display_order = 2)
ON CONFLICT DO NOTHING;

INSERT INTO faqs (seo_page_id, question, answer, display_order, category, created_at, updated_at)
SELECT p.id,
       'Is studying ' || COALESCE(m.name, d.name) || ' in ' || c.name || ' worth it?',
       'Run the EduROI calculator with your own tuition, living cost and salary estimates to see a personalised break-even point, net ROI and downside risk for ' || COALESCE(m.name, d.name) || ' in ' || c.name || '.',
       3, 'roi', NOW(), NOW()
FROM seo_pages p
JOIN countries c ON c.id = p.country_id
LEFT JOIN majors m ON m.id = p.major_id
LEFT JOIN degree_levels d ON d.id = p.degree_level_id
WHERE p.page_type IN ('country_major','country_degree')
  AND NOT EXISTS (SELECT 1 FROM faqs f WHERE f.seo_page_id = p.id AND f.display_order = 3)
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================================================
-- Coverage report
-- ============================================================================
SELECT 'countries' AS table_name, count(*) AS rows FROM countries
UNION ALL SELECT 'currencies', count(*) FROM currencies
UNION ALL SELECT 'majors', count(*) FROM majors
UNION ALL SELECT 'degree_levels', count(*) FROM degree_levels
UNION ALL SELECT 'universities', count(*) FROM universities
UNION ALL SELECT 'university_programs', count(*) FROM university_programs
UNION ALL SELECT 'cost_of_living', count(*) FROM cost_of_living
UNION ALL SELECT 'salary_statistics', count(*) FROM salary_statistics
UNION ALL SELECT 'tax_rules', count(*) FROM tax_rules
UNION ALL SELECT 'loan_rules', count(*) FROM loan_rules
UNION ALL SELECT 'seo_pages', count(*) FROM seo_pages
UNION ALL SELECT 'faqs', count(*) FROM faqs
UNION ALL SELECT 'ad_zones', count(*) FROM ad_zones
UNION ALL SELECT 'affiliate_products', count(*) FROM affiliate_products
ORDER BY table_name;

SELECT 'countries without universities' AS gap, count(*) AS n FROM countries c
WHERE NOT EXISTS (SELECT 1 FROM universities u WHERE u.country_id = c.id)
UNION ALL SELECT 'countries without loan rules', count(*) FROM countries c
WHERE NOT EXISTS (SELECT 1 FROM loan_rules l WHERE l.country_id = c.id)
UNION ALL SELECT 'countries without cost of living', count(*) FROM countries c
WHERE NOT EXISTS (SELECT 1 FROM cost_of_living x WHERE x.country_id = c.id)
UNION ALL SELECT 'countries without tax rules', count(*) FROM countries c
WHERE NOT EXISTS (SELECT 1 FROM tax_rules t WHERE t.country_id = c.id)
UNION ALL SELECT 'degree levels without salary data', count(*) FROM degree_levels d
WHERE NOT EXISTS (SELECT 1 FROM salary_statistics s WHERE s.degree_level_id = d.id)
UNION ALL SELECT 'majors without salary data', count(*) FROM majors m
WHERE NOT EXISTS (SELECT 1 FROM salary_statistics s WHERE s.major_id = m.id);
