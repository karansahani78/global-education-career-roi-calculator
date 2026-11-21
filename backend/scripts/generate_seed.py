#!/usr/bin/env python3
"""
Generate an idempotent PostgreSQL seed for the Education ROI Calculator.

Data sources (snapshots in ./data):
  * World Bank  - GDP per capita (NY.GDP.PCAP.CD), Human Capital Index (HD.HCI.OVRL),
                  education expenditure (SE.XPD.TOTL.GD.ZS)
  * open.er-api - live USD exchange rates
  * Numbeo      - cost-of-living / rent / groceries indices
  * mledoze/countries - ISO country, currency, region, capital metadata

Curated editorial data: majors, degree levels, universities, tax benchmarks,
loan benchmarks, ad zones, affiliate products and SEO page templates.

Usage:
  python3 scripts/generate_seed.py
  # writes src/main/resources/db/seed_reference_data.sql
"""

from __future__ import annotations

import json
import math
import os
import re
import unicodedata
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = Path(__file__).resolve().parent / "data"
OUT = ROOT / "src" / "main" / "resources" / "db" / "seed_reference_data.sql"
YEAR = 2025

# ----------------------------------------------------------------------------
# helpers
# ----------------------------------------------------------------------------

def q(value) -> str:
    """Quote a SQL string literal."""
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float)):
        if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
            return "NULL"
        return repr(value)
    if isinstance(value, str) and value == "NULL":
        return "NULL"
    if isinstance(value, str) and value == "NOW()":
        return "NOW()"
    s = str(value).replace("'", "''")
    return f"'{s}'"


def num(value, digits=2) -> str:
    if value is None:
        return "NULL"
    return f"{float(value):.{digits}f}"


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    value = value.lower()
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


# ----------------------------------------------------------------------------
# source data
# ----------------------------------------------------------------------------

mledoze = json.loads((DATA / "mledoze.json").read_text(encoding="utf-8"))
gdp = json.loads((DATA / "gdp_latest.json").read_text(encoding="utf-8"))
hci = json.loads((DATA / "hci_latest.json").read_text(encoding="utf-8"))
edexp = json.loads((DATA / "edexp_latest.json").read_text(encoding="utf-8"))
rates_doc = json.loads((DATA / "rates.json").read_text(encoding="utf-8"))
numbeo = json.loads((DATA / "numbeo_parsed.json").read_text(encoding="utf-8"))

RATES = rates_doc["rates"]
RATES["USD"] = 1.0

# The World Bank snapshot stores [year, value, name, region, income_level].
GDP = {k: v[1] for k, v in gdp.items()}
INCOME = {k: v[4] for k, v in gdp.items()}
WB_NAME = {k: v[2] for k, v in gdp.items()}
HCI = {k: v[1] for k, v in hci.items()}
EDEXP = {k: v[1] for k, v in edexp.items()}

ML = {c["cca3"]: c for c in mledoze if c.get("cca3")}

NUMBEO_ALIASES = {
    "Czechia": "Czech Republic",
    "Türkiye": "Turkey",
    "Turkiye": "Turkey",
    "Russia": "Russia",
    "South Korea": "South Korea",
    "Korea, Rep.": "South Korea",
    "Vietnam": "Vietnam",
    "Taiwan": "Taiwan",
    "Hong Kong": "Hong Kong",
    "Macao": "Macao",
    "Côte d'Ivoire": "Cote d'Ivoire",
    "Cote d'Ivoire": "Cote d'Ivoire",
    "DR Congo": "Democratic Republic of the Congo",
    "Congo": "Congo",
    "United States": "United States",
    "United Kingdom": "United Kingdom",
    "United Arab Emirates": "United Arab Emirates",
    "Bosnia and Herzegovina": "Bosnia and Herzegovina",
    "North Macedonia": "North Macedonia",
    "Moldova": "Moldova",
    "Syria": "Syria",
    "Laos": "Laos",
    "Brunei": "Brunei",
    "Palestine": "Palestine",
    "Cabo Verde": "Cape Verde",
    "Eswatini": "Swaziland",
    "Timor-Leste": "East Timor",
    "Myanmar": "Myanmar",
}

# Effective average personal income tax + social contribution benchmarks (%).
AVG_TAX = {
    "USA": 24, "GBR": 25, "CAN": 26, "AUS": 24, "NZL": 23, "IRL": 27,
    "DEU": 30, "FRA": 32, "ITA": 30, "ESP": 25, "PRT": 25, "NLD": 30,
    "BEL": 32, "AUT": 30, "CHE": 22, "DNK": 33, "SWE": 30, "NOR": 30,
    "FIN": 30, "ISL": 28, "POL": 24, "CZE": 24, "SVK": 22, "HUN": 22,
    "ROU": 20, "BGR": 20, "GRC": 25, "TUR": 25, "RUS": 20, "UKR": 20,
    "SRB": 20, "HRV": 24, "SVN": 26, "EST": 22, "LVA": 22, "LTU": 22,
    "LUX": 30, "MLT": 25, "CYP": 25, "JPN": 25, "KOR": 22, "CHN": 22,
    "HKG": 15, "SGP": 15, "TWN": 18, "IND": 20, "PAK": 15, "BGD": 15,
    "LKA": 15, "NPL": 15, "MYS": 20, "THA": 18, "IDN": 18, "PHL": 20,
    "VNM": 18, "KHM": 15, "LAO": 15, "MMR": 15, "MNG": 18, "KAZ": 18,
    "UZB": 15, "KGZ": 15, "TJK": 15, "TKM": 15, "AZE": 18, "ARM": 18,
    "GEO": 18, "ISR": 28, "SAU": 0, "ARE": 0, "QAT": 0, "KWT": 0,
    "BHR": 0, "OMN": 0, "JOR": 15, "LBN": 15, "IRQ": 15, "IRN": 15,
    "EGY": 18, "MAR": 20, "DZA": 20, "TUN": 20, "LBY": 15, "ZAF": 25,
    "NGA": 18, "KEN": 20, "GHA": 20, "ETH": 15, "TZA": 15, "UGA": 15,
    "RWA": 15, "SEN": 20, "CIV": 20, "CMR": 20, "ZWE": 20, "ZMB": 15,
    "MOZ": 15, "AGO": 15, "NAM": 20, "BWA": 20, "MUS": 15, "BRA": 25,
    "MEX": 22, "ARG": 25, "CHL": 20, "COL": 22, "PER": 20, "ECU": 20,
    "URY": 25, "PRY": 15, "BOL": 15, "VEN": 20, "CRI": 20, "PAN": 20,
    "GTM": 15, "HND": 15, "SLV": 15, "NIC": 15, "DOM": 15, "CUB": 15,
    "JAM": 20, "TTO": 20, "HTI": 15,
}

REGION_MAP = {
    "Africa": "Africa",
    "Asia": "Asia",
    "Europe": "Europe",
    "Oceania": "Oceania",
    "Americas": "Americas",
}

# ----------------------------------------------------------------------------
# majors (salary in USD, growth in %, demand 0-100)
# ----------------------------------------------------------------------------

MAJORS = [
    ("Computer Science", "STEM", "Software, algorithms, systems and the foundations of computing.", 120000, 15, 96),
    ("Data Science", "STEM", "Statistics, machine learning and data-driven decision making.", 118000, 22, 95),
    ("Artificial Intelligence", "STEM", "Machine learning, neural networks, robotics and intelligent systems.", 125000, 25, 96),
    ("Software Engineering", "STEM", "Designing, building and maintaining large-scale software systems.", 115000, 17, 94),
    ("Cybersecurity", "STEM", "Securing networks, systems, data and critical infrastructure.", 112000, 20, 93),
    ("Information Technology", "STEM", "Enterprise systems, cloud infrastructure and IT service delivery.", 98000, 13, 90),
    ("Electrical Engineering", "Engineering", "Power systems, electronics, control and communications.", 100000, 8, 88),
    ("Mechanical Engineering", "Engineering", "Machines, thermodynamics, manufacturing and product design.", 92000, 7, 85),
    ("Civil Engineering", "Engineering", "Structures, transport, water and construction systems.", 85000, 6, 82),
    ("Chemical Engineering", "Engineering", "Process engineering, materials, energy and pharmaceuticals.", 95000, 6, 83),
    ("Biomedical Engineering", "Engineering", "Medical devices, biomechanics and healthcare technology.", 92000, 10, 84),
    ("Aerospace Engineering", "Engineering", "Aircraft, spacecraft, propulsion and flight systems.", 98000, 8, 83),
    ("Industrial Engineering", "Engineering", "Operations, logistics, optimisation and systems engineering.", 88000, 7, 80),
    ("Petroleum Engineering", "Engineering", "Reservoir, drilling and energy extraction engineering.", 105000, 3, 75),
    ("Environmental Engineering", "Engineering", "Water, air, waste and sustainable infrastructure.", 78000, 9, 78),
    ("Robotics Engineering", "Engineering", "Autonomous systems, automation, sensors and control.", 105000, 18, 86),
    ("Mathematics", "STEM", "Pure and applied mathematics, modelling and proof.", 95000, 12, 84),
    ("Statistics", "STEM", "Statistical inference, experimental design and analytics.", 97000, 15, 86),
    ("Actuarial Science", "STEM", "Risk modelling, insurance and financial mathematics.", 105000, 20, 85),
    ("Physics", "STEM", "Matter, energy, quantum systems and applied physics.", 90000, 9, 80),
    ("Chemistry", "STEM", "Molecular science, materials, analytical and industrial chemistry.", 82000, 6, 76),
    ("Biology", "STEM", "Living systems, ecology, genetics and laboratory science.", 75000, 8, 74),
    ("Biochemistry", "STEM", "Molecular biology, metabolism and biomedical research.", 82000, 9, 76),
    ("Biotechnology", "STEM", "Genetic engineering, bioprocessing and life-science innovation.", 85000, 12, 79),
    ("Environmental Science", "STEM", "Climate, ecosystems, sustainability and environmental policy.", 72000, 9, 75),
    ("Neuroscience", "STEM", "Brain, behaviour, cognition and nervous-system research.", 88000, 14, 80),
    ("Medicine", "Healthcare", "Clinical medicine, diagnostics, treatment and patient care.", 180000, 10, 92),
    ("Nursing", "Healthcare", "Clinical care, patient advocacy and health systems practice.", 85000, 12, 90),
    ("Pharmacy", "Healthcare", "Medication therapy, pharmacology and pharmaceutical care.", 95000, 7, 84),
    ("Dentistry", "Healthcare", "Oral health, dental surgery and clinical practice.", 120000, 8, 85),
    ("Veterinary Medicine", "Healthcare", "Animal health, surgery and veterinary clinical practice.", 90000, 9, 80),
    ("Public Health", "Healthcare", "Population health, epidemiology and health policy.", 78000, 13, 82),
    ("Physiotherapy", "Healthcare", "Rehabilitation, movement science and musculoskeletal care.", 75000, 15, 80),
    ("Nutrition", "Healthcare", "Dietetics, food science and clinical nutrition.", 68000, 13, 74),
    ("Psychology", "Social Sciences", "Human behaviour, research methods and applied psychology.", 70000, 8, 76),
    ("Business Administration", "Business", "Management, strategy, operations and entrepreneurship.", 90000, 6, 83),
    ("Finance", "Business", "Corporate finance, investment, banking and risk.", 100000, 8, 86),
    ("Accounting", "Business", "Financial reporting, audit, tax and management accounting.", 82000, 6, 84),
    ("Marketing", "Business", "Brand, growth, consumer research and digital marketing.", 78000, 9, 80),
    ("Economics", "Business", "Micro, macro, econometrics and economic policy.", 95000, 7, 82),
    ("Human Resources", "Business", "People operations, talent, compensation and labour relations.", 70000, 6, 74),
    ("Supply Chain Management", "Business", "Procurement, logistics, operations and global trade.", 82000, 8, 78),
    ("Entrepreneurship", "Business", "Venture creation, innovation and small-business management.", 85000, 10, 76),
    ("Hospitality Management", "Business", "Hotels, tourism operations and service management.", 62000, 10, 74),
    ("Tourism Management", "Business", "Destination management, travel and sustainable tourism.", 60000, 11, 72),
    ("Law", "Law", "Legal analysis, advocacy, contracts and professional practice.", 110000, 5, 84),
    ("International Relations", "Social Sciences", "Diplomacy, global governance and international policy.", 72000, 6, 72),
    ("Political Science", "Social Sciences", "Government, public policy and political analysis.", 70000, 5, 70),
    ("Sociology", "Social Sciences", "Society, institutions, inequality and social research.", 65000, 5, 68),
    ("Anthropology", "Social Sciences", "Culture, human evolution and ethnographic research.", 60000, 4, 62),
    ("Criminology", "Social Sciences", "Crime, justice systems and public safety.", 62000, 6, 70),
    ("Education", "Education", "Teaching, curriculum design and learning sciences.", 60000, 5, 76),
    ("Early Childhood Education", "Education", "Child development, early learning and classroom practice.", 52000, 7, 74),
    ("Social Work", "Social Sciences", "Community support, counselling and social services.", 58000, 12, 78),
    ("Architecture", "Design", "Building design, planning and construction systems.", 78000, 6, 76),
    ("Urban Planning", "Design", "Land use, cities, transport and sustainable development.", 75000, 8, 74),
    ("Graphic Design", "Design", "Visual identity, typography and brand communication.", 68000, 7, 72),
    ("UX/UI Design", "Design", "User research, interaction design and product experience.", 85000, 16, 82),
    ("Game Design", "Design", "Game systems, level design and interactive entertainment.", 78000, 12, 74),
    ("Journalism", "Media", "Reporting, editing, investigation and multimedia storytelling.", 62000, 3, 66),
    ("Communications", "Media", "Public relations, media strategy and corporate communication.", 65000, 6, 70),
    ("English Literature", "Humanities", "Literary analysis, writing and cultural studies.", 60000, 4, 65),
    ("History", "Humanities", "Historical research, archives and critical interpretation.", 58000, 3, 62),
    ("Philosophy", "Humanities", "Logic, ethics, metaphysics and critical reasoning.", 60000, 4, 60),
    ("Music", "Arts", "Performance, composition, production and musicology.", 58000, 5, 62),
    ("Fine Arts", "Arts", "Studio practice, visual arts and creative expression.", 55000, 4, 60),
    ("Agriculture", "Science", "Agronomy, food systems and sustainable farming.", 65000, 7, 72),
    ("Geology", "Science", "Earth systems, minerals, energy and environmental geology.", 80000, 7, 72),
    ("Sports Science", "Healthcare", "Exercise physiology, performance and sports medicine.", 65000, 14, 72),
    ("Library Science", "Humanities", "Information management, archives and knowledge systems.", 55000, 4, 60),
]

DEGREES = [
    ("Certificate", "certificate", 1, "Short vocational or professional credential.", 1, 0.62),
    ("Associate Degree", "associate", 2, "Two-year undergraduate qualification.", 2, 0.80),
    ("Diploma", "diploma", 2, "Two-year applied or professional diploma.", 2, 0.74),
    ("Bachelor's Degree", "bachelors", 4, "Undergraduate degree.", 3, 1.00),
    ("Postgraduate Diploma", "pgdip", 1, "One-year postgraduate qualification.", 4, 1.12),
    ("Master's Degree", "masters", 2, "Postgraduate degree.", 4, 1.22),
    ("PhD", "phd", 5, "Doctoral research degree.", 5, 1.35),
    ("Professional Doctorate", "professional-doctorate", 4, "Practice-based doctoral degree.", 6, 1.55),
    ("Bootcamp", "bootcamp", 1, "Intensive industry skills programme.", 1, 0.70),
]

# ----------------------------------------------------------------------------
# universities (name, country, city, type, world rank, annual tuition USD,
#               acceptance %, graduation %, website)
# ----------------------------------------------------------------------------

UNIVERSITIES = [
    # United States
    ("Massachusetts Institute of Technology", "USA", "Cambridge", "Private", 1, 60156, 4, 96, "https://web.mit.edu"),
    ("Harvard University", "USA", "Cambridge", "Private", 4, 59076, 4, 97, "https://www.harvard.edu"),
    ("Stanford University", "USA", "Stanford", "Private", 5, 62484, 4, 95, "https://www.stanford.edu"),
    ("California Institute of Technology", "USA", "Pasadena", "Private", 15, 63255, 3, 94, "https://www.caltech.edu"),
    ("Princeton University", "USA", "Princeton", "Private", 17, 59710, 4, 97, "https://www.princeton.edu"),
    ("Yale University", "USA", "New Haven", "Private", 16, 64700, 5, 97, "https://www.yale.edu"),
    ("Columbia University", "USA", "New York", "Private", 23, 68400, 4, 96, "https://www.columbia.edu"),
    ("University of Chicago", "USA", "Chicago", "Private", 11, 65243, 6, 95, "https://www.uchicago.edu"),
    ("University of Pennsylvania", "USA", "Philadelphia", "Private", 12, 66104, 6, 96, "https://www.upenn.edu"),
    ("Cornell University", "USA", "Ithaca", "Private", 13, 65204, 7, 94, "https://www.cornell.edu"),
    ("University of California, Berkeley", "USA", "Berkeley", "Public", 10, 48342, 14, 92, "https://www.berkeley.edu"),
    ("University of California, Los Angeles", "USA", "Los Angeles", "Public", 29, 46326, 9, 91, "https://www.ucla.edu"),
    ("Johns Hopkins University", "USA", "Baltimore", "Private", 28, 63340, 8, 94, "https://www.jhu.edu"),
    ("University of Michigan", "USA", "Ann Arbor", "Public", 33, 57273, 18, 92, "https://umich.edu"),
    ("New York University", "USA", "New York", "Private", 38, 60438, 12, 87, "https://www.nyu.edu"),
    ("Carnegie Mellon University", "USA", "Pittsburgh", "Private", 52, 63200, 11, 91, "https://www.cmu.edu"),
    ("Duke University", "USA", "Durham", "Private", 57, 66325, 6, 95, "https://www.duke.edu"),
    ("Northwestern University", "USA", "Evanston", "Private", 47, 65100, 7, 94, "https://www.northwestern.edu"),
    ("University of Washington", "USA", "Seattle", "Public", 63, 42100, 48, 84, "https://www.washington.edu"),
    ("University of California, San Diego", "USA", "San Diego", "Public", 72, 47660, 24, 88, "https://ucsd.edu"),
    ("Georgia Institute of Technology", "USA", "Atlanta", "Public", 97, 34400, 17, 90, "https://www.gatech.edu"),
    ("University of Texas at Austin", "USA", "Austin", "Public", 58, 42000, 29, 82, "https://www.utexas.edu"),
    ("University of Illinois Urbana-Champaign", "USA", "Champaign", "Public", 64, 41100, 45, 85, "https://illinois.edu"),
    ("University of Wisconsin-Madison", "USA", "Madison", "Public", 102, 40600, 49, 84, "https://www.wisc.edu"),
    ("Brown University", "USA", "Providence", "Private", 73, 65146, 5, 96, "https://www.brown.edu"),
    ("Dartmouth College", "USA", "Hanover", "Private", 120, 64600, 6, 96, "https://home.dartmouth.edu"),
    ("Rice University", "USA", "Houston", "Private", 113, 56960, 8, 94, "https://www.rice.edu"),
    ("Vanderbilt University", "USA", "Nashville", "Private", 128, 63946, 7, 93, "https://www.vanderbilt.edu"),
    ("University of Southern California", "USA", "Los Angeles", "Private", 116, 66640, 12, 92, "https://www.usc.edu"),
    ("Boston University", "USA", "Boston", "Private", 172, 65168, 14, 88, "https://www.bu.edu"),
    ("Purdue University", "USA", "West Lafayette", "Public", 99, 31800, 53, 83, "https://www.purdue.edu"),
    ("Ohio State University", "USA", "Columbus", "Public", 151, 37300, 53, 86, "https://www.osu.edu"),
    ("Pennsylvania State University", "USA", "University Park", "Public", 168, 40200, 55, 85, "https://www.psu.edu"),
    ("University of Florida", "USA", "Gainesville", "Public", 168, 30800, 30, 88, "https://www.ufl.edu"),
    ("University of North Carolina at Chapel Hill", "USA", "Chapel Hill", "Public", 92, 39300, 17, 91, "https://www.unc.edu"),
    ("Washington University in St. Louis", "USA", "St. Louis", "Private", 154, 63200, 11, 94, "https://wustl.edu"),
    ("Emory University", "USA", "Atlanta", "Private", 199, 62400, 11, 90, "https://www.emory.edu"),
    ("Georgetown University", "USA", "Washington", "Private", 297, 65000, 12, 94, "https://www.georgetown.edu"),
    ("University of Virginia", "USA", "Charlottesville", "Public", 233, 54600, 19, 94, "https://www.virginia.edu"),
    ("Arizona State University", "USA", "Tempe", "Public", 179, 33000, 88, 66, "https://www.asu.edu"),
    # United Kingdom
    ("University of Cambridge", "GBR", "Cambridge", "Public", 2, 42000, 21, 98, "https://www.cam.ac.uk"),
    ("University of Oxford", "GBR", "Oxford", "Public", 3, 45500, 17, 98, "https://www.ox.ac.uk"),
    ("Imperial College London", "GBR", "London", "Public", 6, 47500, 14, 96, "https://www.imperial.ac.uk"),
    ("University College London", "GBR", "London", "Public", 9, 37500, 30, 93, "https://www.ucl.ac.uk"),
    ("University of Edinburgh", "GBR", "Edinburgh", "Public", 22, 33000, 40, 90, "https://www.ed.ac.uk"),
    ("University of Manchester", "GBR", "Manchester", "Public", 32, 30000, 50, 88, "https://www.manchester.ac.uk"),
    ("King's College London", "GBR", "London", "Public", 40, 34000, 35, 90, "https://www.kcl.ac.uk"),
    ("London School of Economics", "GBR", "London", "Public", 45, 36000, 22, 94, "https://www.lse.ac.uk"),
    ("University of Bristol", "GBR", "Bristol", "Public", 55, 30000, 44, 89, "https://www.bristol.ac.uk"),
    ("University of Warwick", "GBR", "Coventry", "Public", 67, 29500, 45, 89, "https://warwick.ac.uk"),
    ("University of Glasgow", "GBR", "Glasgow", "Public", 76, 28000, 48, 87, "https://www.gla.ac.uk"),
    ("University of Birmingham", "GBR", "Birmingham", "Public", 84, 28500, 50, 87, "https://www.birmingham.ac.uk"),
    ("University of Leeds", "GBR", "Leeds", "Public", 75, 27500, 48, 87, "https://www.leeds.ac.uk"),
    ("University of Sheffield", "GBR", "Sheffield", "Public", 104, 27000, 51, 86, "https://www.sheffield.ac.uk"),
    ("University of Nottingham", "GBR", "Nottingham", "Public", 100, 28000, 49, 86, "https://www.nottingham.ac.uk"),
    ("University of Southampton", "GBR", "Southampton", "Public", 81, 27500, 51, 87, "https://www.southampton.ac.uk"),
    ("Durham University", "GBR", "Durham", "Public", 78, 29000, 41, 90, "https://www.durham.ac.uk"),
    ("University of St Andrews", "GBR", "St Andrews", "Public", 95, 32000, 41, 92, "https://www.st-andrews.ac.uk"),
    # Canada
    ("University of Toronto", "CAN", "Toronto", "Public", 21, 45000, 43, 85, "https://www.utoronto.ca"),
    ("University of British Columbia", "CAN", "Vancouver", "Public", 34, 42000, 50, 84, "https://www.ubc.ca"),
    ("McGill University", "CAN", "Montreal", "Public", 30, 35000, 40, 85, "https://www.mcgill.ca"),
    ("McMaster University", "CAN", "Hamilton", "Public", 189, 33000, 58, 82, "https://www.mcmaster.ca"),
    ("University of Alberta", "CAN", "Edmonton", "Public", 111, 30000, 58, 81, "https://www.ualberta.ca"),
    ("Université de Montréal", "CAN", "Montreal", "Public", 141, 28000, 60, 80, "https://www.umontreal.ca"),
    ("University of Waterloo", "CAN", "Waterloo", "Public", 112, 38000, 53, 86, "https://uwaterloo.ca"),
    ("Western University", "CAN", "London", "Public", 114, 34000, 57, 83, "https://www.uwo.ca"),
    ("Queen's University", "CAN", "Kingston", "Public", 209, 35000, 55, 84, "https://www.queensu.ca"),
    ("University of Calgary", "CAN", "Calgary", "Public", 182, 31000, 60, 80, "https://www.ucalgary.ca"),
    # Australia
    ("University of Melbourne", "AUS", "Melbourne", "Public", 14, 35000, 70, 88, "https://www.unimelb.edu.au"),
    ("University of Sydney", "AUS", "Sydney", "Public", 19, 38000, 68, 87, "https://www.sydney.edu.au"),
    ("University of New South Wales", "AUS", "Sydney", "Public", 20, 36000, 60, 86, "https://www.unsw.edu.au"),
    ("Australian National University", "AUS", "Canberra", "Public", 34, 34000, 45, 85, "https://www.anu.edu.au"),
    ("Monash University", "AUS", "Melbourne", "Public", 36, 34000, 60, 86, "https://www.monash.edu"),
    ("University of Queensland", "AUS", "Brisbane", "Public", 43, 33000, 62, 85, "https://www.uq.edu.au"),
    ("University of Western Australia", "AUS", "Perth", "Public", 72, 32000, 60, 84, "https://www.uwa.edu.au"),
    ("University of Adelaide", "AUS", "Adelaide", "Public", 89, 31000, 62, 84, "https://www.adelaide.edu.au"),
    ("University of Technology Sydney", "AUS", "Sydney", "Public", 90, 33000, 68, 83, "https://www.uts.edu.au"),
    ("RMIT University", "AUS", "Melbourne", "Public", 223, 30000, 70, 80, "https://www.rmit.edu.au"),
    # Germany
    ("Technical University of Munich", "DEU", "Munich", "Public", 37, 500, 25, 92, "https://www.tum.de"),
    ("Ludwig Maximilian University of Munich", "DEU", "Munich", "Public", 54, 500, 30, 91, "https://www.lmu.de"),
    ("Heidelberg University", "DEU", "Heidelberg", "Public", 87, 500, 30, 92, "https://www.uni-heidelberg.de"),
    ("Humboldt University of Berlin", "DEU", "Berlin", "Public", 120, 500, 35, 89, "https://www.hu-berlin.de"),
    ("Free University of Berlin", "DEU", "Berlin", "Public", 98, 500, 40, 88, "https://www.fu-berlin.de"),
    ("RWTH Aachen University", "DEU", "Aachen", "Public", 106, 500, 40, 89, "https://www.rwth-aachen.de"),
    ("Karlsruhe Institute of Technology", "DEU", "Karlsruhe", "Public", 119, 500, 40, 88, "https://www.kit.edu"),
    ("Technical University of Berlin", "DEU", "Berlin", "Public", 154, 500, 45, 86, "https://www.tu.berlin"),
    ("University of Hamburg", "DEU", "Hamburg", "Public", 205, 500, 45, 86, "https://www.uni-hamburg.de"),
    ("University of Bonn", "DEU", "Bonn", "Public", 239, 500, 45, 87, "https://www.uni-bonn.de"),
    # Netherlands
    ("University of Amsterdam", "NLD", "Amsterdam", "Public", 53, 16000, 35, 88, "https://www.uva.nl"),
    ("Delft University of Technology", "NLD", "Delft", "Public", 47, 18000, 40, 90, "https://www.tudelft.nl"),
    ("Leiden University", "NLD", "Leiden", "Public", 107, 16000, 40, 89, "https://www.universiteitleiden.nl"),
    ("Utrecht University", "NLD", "Utrecht", "Public", 88, 16000, 40, 89, "https://www.uu.nl"),
    ("University of Groningen", "NLD", "Groningen", "Public", 139, 15000, 45, 87, "https://www.rug.nl"),
    ("Erasmus University Rotterdam", "NLD", "Rotterdam", "Public", 176, 17000, 40, 88, "https://www.eur.nl"),
    ("Eindhoven University of Technology", "NLD", "Eindhoven", "Public", 124, 17000, 45, 88, "https://www.tue.nl"),
    ("Wageningen University", "NLD", "Wageningen", "Public", 151, 16000, 45, 89, "https://www.wur.nl"),
    # Switzerland
    ("ETH Zurich", "CHE", "Zurich", "Public", 7, 2000, 27, 92, "https://ethz.ch"),
    ("EPFL", "CHE", "Lausanne", "Public", 36, 2000, 30, 91, "https://www.epfl.ch"),
    ("University of Zurich", "CHE", "Zurich", "Public", 91, 2000, 35, 90, "https://www.uzh.ch"),
    ("University of Geneva", "CHE", "Geneva", "Public", 128, 2000, 40, 89, "https://www.unige.ch"),
    ("University of Basel", "CHE", "Basel", "Public", 136, 2000, 40, 89, "https://www.unibas.ch"),
    # France
    ("Paris Sciences et Lettres University", "FRA", "Paris", "Public", 24, 3000, 10, 90, "https://psl.eu"),
    ("Sorbonne University", "FRA", "Paris", "Public", 59, 3000, 20, 89, "https://www.sorbonne-universite.fr"),
    ("Sciences Po", "FRA", "Paris", "Public", 319, 15000, 20, 90, "https://www.sciencespo.fr"),
    ("École Polytechnique", "FRA", "Palaiseau", "Public", 38, 12000, 10, 95, "https://www.polytechnique.edu"),
    ("École Normale Supérieure de Lyon", "FRA", "Lyon", "Public", 184, 3000, 15, 92, "https://www.ens-lyon.fr"),
    ("Paris-Saclay University", "FRA", "Paris", "Public", 71, 3000, 25, 88, "https://www.universite-paris-saclay.fr"),
    ("Grenoble Alpes University", "FRA", "Grenoble", "Public", 294, 3000, 30, 86, "https://www.univ-grenoble-alpes.fr"),
    ("HEC Paris", "FRA", "Jouy-en-Josas", "Private", 130, 24000, 15, 93, "https://www.hec.edu"),
    # Italy
    ("University of Bologna", "ITA", "Bologna", "Public", 154, 3000, 30, 87, "https://www.unibo.it"),
    ("Sapienza University of Rome", "ITA", "Rome", "Public", 134, 3000, 35, 85, "https://www.uniroma1.it"),
    ("University of Milan", "ITA", "Milan", "Public", 276, 3000, 35, 86, "https://www.unimi.it"),
    ("University of Padua", "ITA", "Padua", "Public", 219, 3000, 35, 86, "https://www.unipd.it"),
    ("University of Turin", "ITA", "Turin", "Public", 364, 3000, 40, 84, "https://www.unito.it"),
    # Spain
    ("University of Barcelona", "ESP", "Barcelona", "Public", 164, 3500, 35, 86, "https://www.ub.edu"),
    ("Autonomous University of Barcelona", "ESP", "Barcelona", "Public", 149, 3500, 35, 87, "https://www.uab.cat"),
    ("Complutense University of Madrid", "ESP", "Madrid", "Public", 226, 3500, 40, 85, "https://www.ucm.es"),
    ("Autonomous University of Madrid", "ESP", "Madrid", "Public", 215, 3500, 40, 85, "https://www.uam.es"),
    ("University of Navarra", "ESP", "Pamplona", "Private", 280, 18000, 25, 89, "https://www.unav.edu"),
    # Sweden
    ("Karolinska Institute", "SWE", "Stockholm", "Public", 45, 15000, 20, 92, "https://ki.se"),
    ("Lund University", "SWE", "Lund", "Public", 85, 14000, 35, 88, "https://www.lunduniversity.lu.se"),
    ("Uppsala University", "SWE", "Uppsala", "Public", 105, 14000, 35, 88, "https://www.uu.se"),
    ("Stockholm University", "SWE", "Stockholm", "Public", 118, 14000, 40, 87, "https://www.su.se"),
    ("Chalmers University of Technology", "SWE", "Gothenburg", "Public", 139, 15000, 40, 88, "https://www.chalmers.se"),
    # Denmark / Norway / Finland
    ("University of Copenhagen", "DNK", "Copenhagen", "Public", 79, 16000, 30, 90, "https://www.ku.dk"),
    ("Technical University of Denmark", "DNK", "Lyngby", "Public", 121, 16000, 35, 89, "https://www.dtu.dk"),
    ("Aarhus University", "DNK", "Aarhus", "Public", 143, 15000, 35, 88, "https://www.au.dk"),
    ("University of Oslo", "NOR", "Oslo", "Public", 117, 0, 40, 89, "https://www.uio.no"),
    ("Norwegian University of Science and Technology", "NOR", "Trondheim", "Public", 292, 0, 40, 87, "https://www.ntnu.edu"),
    ("University of Bergen", "NOR", "Bergen", "Public", 281, 0, 40, 87, "https://www.uib.no"),
    ("University of Helsinki", "FIN", "Helsinki", "Public", 106, 15000, 35, 89, "https://www.helsinki.fi"),
    ("Aalto University", "FIN", "Espoo", "Public", 116, 15000, 35, 89, "https://www.aalto.fi"),
    ("University of Turku", "FIN", "Turku", "Public", 315, 12000, 40, 86, "https://www.utu.fi"),
    # Ireland / Belgium / Austria
    ("Trinity College Dublin", "IRL", "Dublin", "Public", 81, 28000, 35, 90, "https://www.tcd.ie"),
    ("University College Dublin", "IRL", "Dublin", "Public", 171, 26000, 40, 88, "https://www.ucd.ie"),
    ("University of Galway", "IRL", "Galway", "Public", 289, 24000, 45, 86, "https://www.universityofgalway.ie"),
    ("KU Leuven", "BEL", "Leuven", "Public", 61, 6000, 30, 90, "https://www.kuleuven.be"),
    ("Ghent University", "BEL", "Ghent", "Public", 143, 6000, 35, 89, "https://www.ugent.be"),
    ("UCLouvain", "BEL", "Louvain-la-Neuve", "Public", 189, 6000, 35, 88, "https://uclouvain.be"),
    ("University of Vienna", "AUT", "Vienna", "Public", 130, 1500, 30, 88, "https://www.univie.ac.at"),
    ("TU Wien", "AUT", "Vienna", "Public", 184, 1500, 35, 87, "https://www.tuwien.at"),
    ("University of Graz", "AUT", "Graz", "Public", 401, 1500, 40, 85, "https://www.uni-graz.at"),
    # Poland / Czechia / Hungary / Portugal / Russia
    ("University of Warsaw", "POL", "Warsaw", "Public", 262, 4000, 35, 86, "https://www.uw.edu.pl"),
    ("Jagiellonian University", "POL", "Krakow", "Public", 304, 4000, 35, 86, "https://www.uj.edu.pl"),
    ("Wroclaw University of Science and Technology", "POL", "Wroclaw", "Public", 801, 3500, 45, 84, "https://pwr.edu.pl"),
    ("Charles University", "CZE", "Prague", "Public", 248, 5000, 30, 87, "https://www.cuni.cz"),
    ("Czech Technical University in Prague", "CZE", "Prague", "Public", 454, 5000, 35, 85, "https://www.cvut.cz"),
    ("Eötvös Loránd University", "HUN", "Budapest", "Public", 564, 4000, 40, 84, "https://www.elte.hu"),
    ("Budapest University of Technology", "HUN", "Budapest", "Public", 741, 4000, 45, 83, "https://www.bme.hu"),
    ("University of Lisbon", "PRT", "Lisbon", "Public", 260, 4000, 35, 86, "https://www.ulisboa.pt"),
    ("University of Porto", "PRT", "Porto", "Public", 253, 4000, 35, 86, "https://www.up.pt"),
    ("University of Coimbra", "PRT", "Coimbra", "Public", 351, 4000, 40, 85, "https://www.uc.pt"),
    ("Lomonosov Moscow State University", "RUS", "Moscow", "Public", 87, 5000, 25, 90, "https://www.msu.ru"),
    ("Saint Petersburg State University", "RUS", "Saint Petersburg", "Public", 240, 5000, 30, 88, "https://english.spbu.ru"),
    ("HSE University", "RUS", "Moscow", "Public", 322, 6000, 30, 87, "https://www.hse.ru/en"),
    ("Novosibirsk State University", "RUS", "Novosibirsk", "Public", 421, 4000, 35, 86, "https://www.nsu.ru"),
    # Turkey
    ("Boğaziçi University", "TUR", "Istanbul", "Public", 401, 3000, 15, 90, "https://www.boun.edu.tr"),
    ("Middle East Technical University", "TUR", "Ankara", "Public", 336, 3000, 20, 89, "https://www.metu.edu.tr"),
    ("Istanbul University", "TUR", "Istanbul", "Public", 621, 2500, 30, 86, "https://www.istanbul.edu.tr"),
    ("Koç University", "TUR", "Istanbul", "Private", 431, 22000, 15, 91, "https://www.ku.edu.tr"),
    ("Sabancı University", "TUR", "Istanbul", "Private", 471, 20000, 18, 90, "https://www.sabanciuniv.edu"),
    # Japan
    ("University of Tokyo", "JPN", "Tokyo", "Public", 28, 5000, 15, 95, "https://www.u-tokyo.ac.jp"),
    ("Kyoto University", "JPN", "Kyoto", "Public", 46, 5000, 20, 94, "https://www.kyoto-u.ac.jp"),
    ("Osaka University", "JPN", "Osaka", "Public", 80, 5000, 25, 93, "https://www.osaka-u.ac.jp"),
    ("Tohoku University", "JPN", "Sendai", "Public", 113, 5000, 25, 92, "https://www.tohoku.ac.jp"),
    ("Tokyo Institute of Technology", "JPN", "Tokyo", "Public", 91, 5000, 20, 93, "https://www.titech.ac.jp"),
    ("Nagoya University", "JPN", "Nagoya", "Public", 118, 5000, 25, 92, "https://www.nagoya-u.ac.jp"),
    ("Kyushu University", "JPN", "Fukuoka", "Public", 164, 5000, 30, 91, "https://www.kyushu-u.ac.jp"),
    ("Hokkaido University", "JPN", "Sapporo", "Public", 196, 5000, 30, 91, "https://www.hokudai.ac.jp"),
    # South Korea
    ("Seoul National University", "KOR", "Seoul", "Public", 41, 8000, 15, 95, "https://www.snu.ac.kr"),
    ("KAIST", "KOR", "Daejeon", "Public", 53, 8000, 20, 94, "https://www.kaist.ac.kr"),
    ("Korea University", "KOR", "Seoul", "Private", 79, 12000, 25, 93, "https://www.korea.ac.kr"),
    ("Yonsei University", "KOR", "Seoul", "Private", 76, 12000, 25, 93, "https://www.yonsei.ac.kr"),
    ("Sungkyunkwan University", "KOR", "Seoul", "Private", 145, 11000, 30, 91, "https://www.skku.edu"),
    ("Hanyang University", "KOR", "Seoul", "Private", 164, 10000, 35, 90, "https://www.hanyang.ac.kr"),
    # China / Hong Kong / Taiwan
    ("Tsinghua University", "CHN", "Beijing", "Public", 25, 5000, 1, 96, "https://www.tsinghua.edu.cn"),
    ("Peking University", "CHN", "Beijing", "Public", 17, 5000, 1, 95, "https://www.pku.edu.cn"),
    ("Fudan University", "CHN", "Shanghai", "Public", 50, 6000, 5, 94, "https://www.fudan.edu.cn"),
    ("Shanghai Jiao Tong University", "CHN", "Shanghai", "Public", 51, 6000, 5, 94, "https://www.sjtu.edu.cn"),
    ("Zhejiang University", "CHN", "Hangzhou", "Public", 42, 5000, 5, 94, "https://www.zju.edu.cn"),
    ("Nanjing University", "CHN", "Nanjing", "Public", 133, 5000, 8, 92, "https://www.nju.edu.cn"),
    ("University of Science and Technology of China", "CHN", "Hefei", "Public", 94, 5000, 5, 94, "https://www.ustc.edu.cn"),
    ("Wuhan University", "CHN", "Wuhan", "Public", 194, 5000, 10, 91, "https://www.whu.edu.cn"),
    ("Huazhong University of Science and Technology", "CHN", "Wuhan", "Public", 275, 5000, 12, 90, "https://www.hust.edu.cn"),
    ("Sun Yat-sen University", "CHN", "Guangzhou", "Public", 267, 5000, 12, 90, "https://www.sysu.edu.cn"),
    ("Xi'an Jiaotong University", "CHN", "Xi'an", "Public", 291, 5000, 12, 90, "https://www.xjtu.edu.cn"),
    ("Harbin Institute of Technology", "CHN", "Harbin", "Public", 256, 5000, 12, 90, "https://www.hit.edu.cn"),
    ("University of Hong Kong", "HKG", "Hong Kong", "Public", 26, 25000, 25, 90, "https://www.hku.hk"),
    ("Hong Kong University of Science and Technology", "HKG", "Hong Kong", "Public", 60, 24000, 25, 90, "https://hkust.edu.hk"),
    ("Chinese University of Hong Kong", "HKG", "Hong Kong", "Public", 47, 23000, 25, 90, "https://www.cuhk.edu.hk"),
    ("City University of Hong Kong", "HKG", "Hong Kong", "Public", 70, 22000, 30, 89, "https://www.cityu.edu.hk"),
    ("National Taiwan University", "TWN", "Taipei", "Public", 69, 5000, 15, 93, "https://www.ntu.edu.tw"),
    ("National Tsing Hua University", "TWN", "Hsinchu", "Public", 210, 5000, 20, 91, "https://www.nthu.edu.tw"),
    ("National Cheng Kung University", "TWN", "Tainan", "Public", 228, 5000, 25, 90, "https://www.ncku.edu.tw"),
    # Singapore / Malaysia / Thailand / Indonesia / Philippines / Vietnam
    ("National University of Singapore", "SGP", "Singapore", "Public", 8, 40000, 15, 94, "https://www.nus.edu.sg"),
    ("Nanyang Technological University", "SGP", "Singapore", "Public", 26, 38000, 20, 93, "https://www.ntu.edu.sg"),
    ("University of Malaya", "MYS", "Kuala Lumpur", "Public", 65, 6000, 25, 89, "https://www.um.edu.my"),
    ("Universiti Putra Malaysia", "MYS", "Serdang", "Public", 158, 5000, 30, 88, "https://www.upm.edu.my"),
    ("Universiti Sains Malaysia", "MYS", "Penang", "Public", 137, 5000, 30, 88, "https://www.usm.my"),
    ("Chulalongkorn University", "THA", "Bangkok", "Public", 211, 6000, 20, 90, "https://www.chula.ac.th"),
    ("Mahidol University", "THA", "Salaya", "Public", 382, 7000, 25, 89, "https://www.mahidol.ac.th"),
    ("Kasetsart University", "THA", "Bangkok", "Public", 751, 5000, 30, 87, "https://www.ku.ac.th"),
    ("Universitas Indonesia", "IDN", "Depok", "Public", 237, 4000, 20, 89, "https://www.ui.ac.id"),
    ("Gadjah Mada University", "IDN", "Yogyakarta", "Public", 263, 4000, 20, 89, "https://www.ugm.ac.id"),
    ("Bandung Institute of Technology", "IDN", "Bandung", "Public", 281, 4000, 20, 89, "https://www.itb.ac.id"),
    ("University of the Philippines", "PHL", "Quezon City", "Public", 404, 3000, 25, 88, "https://up.edu.ph"),
    ("Ateneo de Manila University", "PHL", "Quezon City", "Private", 563, 9000, 25, 89, "https://www.ateneo.edu"),
    ("De La Salle University", "PHL", "Manila", "Private", 681, 8000, 30, 88, "https://www.dlsu.edu.ph"),
    ("Vietnam National University, Hanoi", "VNM", "Hanoi", "Public", 951, 3000, 25, 87, "https://vnu.edu.vn"),
    ("Vietnam National University, Ho Chi Minh City", "VNM", "Ho Chi Minh City", "Public", 801, 3000, 25, 86, "https://vnuhcm.edu.vn"),
    # India / Pakistan / Bangladesh / Sri Lanka / Nepal
    ("Indian Institute of Technology Bombay", "IND", "Mumbai", "Public", 149, 2500, 1, 94, "https://www.iitb.ac.in"),
    ("Indian Institute of Technology Delhi", "IND", "New Delhi", "Public", 197, 2500, 1, 94, "https://home.iitd.ac.in"),
    ("Indian Institute of Technology Madras", "IND", "Chennai", "Public", 285, 2500, 1, 94, "https://www.iitm.ac.in"),
    ("Indian Institute of Technology Kanpur", "IND", "Kanpur", "Public", 278, 2500, 1, 93, "https://www.iitk.ac.in"),
    ("Indian Institute of Science", "IND", "Bengaluru", "Public", 225, 2500, 2, 95, "https://iisc.ac.in"),
    ("University of Delhi", "IND", "New Delhi", "Public", 407, 1500, 10, 88, "https://www.du.ac.in"),
    ("Jawaharlal Nehru University", "IND", "New Delhi", "Public", 601, 1500, 5, 89, "https://www.jnu.ac.in"),
    ("BITS Pilani", "IND", "Pilani", "Private", 721, 7000, 12, 88, "https://www.bits-pilani.ac.in"),
    ("Anna University", "IND", "Chennai", "Public", 801, 1800, 15, 86, "https://www.annauniv.edu"),
    ("University of Calcutta", "IND", "Kolkata", "Public", 801, 1200, 15, 85, "https://www.caluniv.ac.in"),
    ("University of Mumbai", "IND", "Mumbai", "Public", 801, 1200, 15, 85, "https://mu.ac.in"),
    ("Manipal Academy of Higher Education", "IND", "Manipal", "Private", 901, 8000, 20, 87, "https://www.manipal.edu"),
    ("National University of Sciences and Technology", "PAK", "Islamabad", "Public", 350, 2500, 10, 89, "https://nust.edu.pk"),
    ("Lahore University of Management Sciences", "PAK", "Lahore", "Private", 601, 6000, 15, 89, "https://lums.edu.pk"),
    ("University of the Punjab", "PAK", "Lahore", "Public", 801, 1500, 20, 85, "https://pu.edu.pk"),
    ("University of Dhaka", "BGD", "Dhaka", "Public", 691, 1000, 15, 86, "https://www.du.ac.bd"),
    ("Bangladesh University of Engineering and Technology", "BGD", "Dhaka", "Public", 801, 1200, 15, 87, "https://www.buet.ac.bd"),
    ("University of Colombo", "LKA", "Colombo", "Public", 801, 1500, 20, 85, "https://cmb.ac.lk"),
    ("University of Peradeniya", "LKA", "Peradeniya", "Public", 801, 1200, 20, 85, "https://www.pdn.ac.lk"),
    ("Tribhuvan University", "NPL", "Kathmandu", "Public", 801, 1000, 25, 83, "https://tu.edu.np"),
    ("Kathmandu University", "NPL", "Dhulikhel", "Private", 901, 3000, 25, 85, "https://ku.edu.np"),
    # Middle East
    ("United Arab Emirates University", "ARE", "Al Ain", "Public", 290, 18000, 30, 87, "https://www.uaeu.ac.ae"),
    ("American University of Sharjah", "ARE", "Sharjah", "Private", 348, 22000, 25, 88, "https://www.aus.edu"),
    ("Khalifa University", "ARE", "Abu Dhabi", "Public", 230, 20000, 25, 89, "https://www.khalifauniversity.ac.ae"),
    ("New York University Abu Dhabi", "ARE", "Abu Dhabi", "Private", 501, 40000, 5, 93, "https://nyuad.nyu.edu"),
    ("King Saud University", "SAU", "Riyadh", "Public", 203, 8000, 25, 88, "https://www.ksu.edu.sa"),
    ("King Abdullah University of Science and Technology", "SAU", "Thuwal", "Public", 201, 0, 5, 92, "https://www.kaust.edu.sa"),
    ("King Abdulaziz University", "SAU", "Jeddah", "Public", 381, 7000, 30, 87, "https://www.kau.edu.sa"),
    ("Qatar University", "QAT", "Doha", "Public", 173, 9000, 25, 88, "https://www.qu.edu.qa"),
    ("Hamad Bin Khalifa University", "QAT", "Doha", "Public", 401, 0, 10, 90, "https://www.hbku.edu.qa"),
    ("Hebrew University of Jerusalem", "ISR", "Jerusalem", "Public", 177, 9000, 25, 89, "https://www.huji.ac.il"),
    ("Tel Aviv University", "ISR", "Tel Aviv", "Public", 209, 9000, 25, 88, "https://www.tau.ac.il"),
    ("Technion - Israel Institute of Technology", "ISR", "Haifa", "Public", 296, 9000, 25, 89, "https://www.technion.ac.il"),
    # Africa
    ("Cairo University", "EGY", "Cairo", "Public", 371, 3000, 30, 85, "https://www.cu.edu.eg"),
    ("Ain Shams University", "EGY", "Cairo", "Public", 601, 2500, 35, 84, "https://www.asu.edu.eg"),
    ("Alexandria University", "EGY", "Alexandria", "Public", 701, 2500, 35, 84, "https://www.alexu.edu.eg"),
    ("University of Cape Town", "ZAF", "Cape Town", "Public", 173, 6000, 25, 88, "https://www.uct.ac.za"),
    ("University of the Witwatersrand", "ZAF", "Johannesburg", "Public", 264, 5500, 30, 86, "https://www.wits.ac.za"),
    ("Stellenbosch University", "ZAF", "Stellenbosch", "Public", 302, 5000, 30, 87, "https://www.sun.ac.za"),
    ("University of Pretoria", "ZAF", "Pretoria", "Public", 323, 5000, 32, 86, "https://www.up.ac.za"),
    ("University of Lagos", "NGA", "Lagos", "Public", 801, 1500, 25, 84, "https://unilag.edu.ng"),
    ("University of Ibadan", "NGA", "Ibadan", "Public", 801, 1200, 20, 85, "https://www.ui.edu.ng"),
    ("Covenant University", "NGA", "Ota", "Private", 1001, 4000, 30, 88, "https://www.covenantuniversity.edu.ng"),
    ("University of Nairobi", "KEN", "Nairobi", "Public", 801, 2000, 25, 84, "https://www.uonbi.ac.ke"),
    ("Strathmore University", "KEN", "Nairobi", "Private", 1001, 4500, 25, 88, "https://www.strathmore.edu"),
    ("University of Ghana", "GHA", "Accra", "Public", 801, 2500, 25, 85, "https://www.ug.edu.gh"),
    ("Kwame Nkrumah University of Science and Technology", "GHA", "Kumasi", "Public", 801, 2200, 25, 84, "https://www.knust.edu.gh"),
    ("Addis Ababa University", "ETH", "Addis Ababa", "Public", 801, 1000, 25, 83, "https://www.aau.edu.et"),
    ("Mohammed V University", "MAR", "Rabat", "Public", 801, 2000, 25, 84, "https://www.um5.ac.ma"),
    ("Al Akhawayn University", "MAR", "Ifrane", "Private", 1001, 8000, 25, 87, "https://www.aui.ma"),
    ("University of Tunis", "TUN", "Tunis", "Public", 901, 1500, 25, 84, "https://www.utm.rnu.tn"),
    # Latin America
    ("University of São Paulo", "BRA", "São Paulo", "Public", 85, 3000, 15, 89, "https://www5.usp.br"),
    ("State University of Campinas", "BRA", "Campinas", "Public", 219, 3000, 18, 88, "https://www.unicamp.br"),
    ("Federal University of Rio de Janeiro", "BRA", "Rio de Janeiro", "Public", 304, 2500, 20, 86, "https://ufrj.br"),
    ("Federal University of Minas Gerais", "BRA", "Belo Horizonte", "Public", 349, 2500, 20, 86, "https://www.ufmg.br"),
    ("Pontifical Catholic University of Rio Grande do Sul", "BRA", "Porto Alegre", "Private", 801, 7000, 30, 85, "https://www.pucrs.br"),
    ("National Autonomous University of Mexico", "MEX", "Mexico City", "Public", 93, 2000, 12, 87, "https://www.unam.mx"),
    ("Tecnológico de Monterrey", "MEX", "Monterrey", "Private", 184, 15000, 20, 89, "https://www.tec.mx"),
    ("University of Guadalajara", "MEX", "Guadalajara", "Public", 401, 1500, 20, 84, "https://www.udg.mx"),
    ("Instituto Tecnológico Autónomo de México", "MEX", "Mexico City", "Private", 601, 14000, 20, 88, "https://www.itam.mx"),
    ("University of Buenos Aires", "ARG", "Buenos Aires", "Public", 67, 500, 5, 86, "https://www.uba.ar"),
    ("National University of La Plata", "ARG", "La Plata", "Public", 401, 500, 10, 84, "https://www.unlp.edu.ar"),
    ("National University of Córdoba", "ARG", "Córdoba", "Public", 501, 500, 10, 84, "https://www.unc.edu.ar"),
    ("University of Chile", "CHL", "Santiago", "Public", 184, 6000, 15, 87, "https://www.uchile.cl"),
    ("Pontifical Catholic University of Chile", "CHL", "Santiago", "Private", 121, 9000, 20, 89, "https://www.uc.cl"),
    ("University of Santiago, Chile", "CHL", "Santiago", "Public", 451, 5000, 20, 85, "https://www.usach.cl"),
    ("National University of Colombia", "COL", "Bogotá", "Public", 226, 1500, 10, 87, "https://unal.edu.co"),
    ("University of the Andes", "COL", "Bogotá", "Private", 251, 8000, 20, 89, "https://uniandes.edu.co"),
    ("University of Antioquia", "COL", "Medellín", "Public", 401, 1200, 15, 85, "https://www.udea.edu.co"),
    ("National University of San Marcos", "PER", "Lima", "Public", 601, 800, 15, 84, "https://www.unmsm.edu.pe"),
    ("Pontifical Catholic University of Peru", "PER", "Lima", "Private", 359, 7000, 20, 88, "https://www.pucp.edu.pe"),
    # New Zealand
    ("University of Auckland", "NZL", "Auckland", "Public", 68, 28000, 45, 86, "https://www.auckland.ac.nz"),
    ("University of Otago", "NZL", "Dunedin", "Public", 206, 26000, 50, 85, "https://www.otago.ac.nz"),
    ("Victoria University of Wellington", "NZL", "Wellington", "Public", 241, 25000, 50, 84, "https://www.wgtn.ac.nz"),
    ("University of Canterbury", "NZL", "Christchurch", "Public", 261, 25000, 50, 84, "https://www.canterbury.ac.nz"),
]

# ----------------------------------------------------------------------------
# monetization reference data
# ----------------------------------------------------------------------------

AD_ZONES = [
    ("header-leaderboard", "adsense", "all", 1, "adsense-header-001"),
    ("sidebar-top", "adsense", "all", 2, "adsense-sidebar-001"),
    ("sidebar-sticky", "adsense", "all", 3, "adsense-sidebar-002"),
    ("below-calculator", "adsense", "calculator", 1, "adsense-calc-001"),
    ("results-top", "adsense", "results", 1, "adsense-results-001"),
    ("results-bottom", "adsense", "results", 2, "adsense-results-002"),
    ("in-content", "adsense", "seo_page", 1, "adsense-content-001"),
    ("footer-banner", "adsense", "all", 1, "adsense-footer-001"),
    ("mobile-sticky", "adsense", "all", 1, "adsense-mobile-001"),
    ("affiliate-sidebar", "affiliate", "all", 2, None),
    ("sponsored-card", "sponsored", "all", 3, None),
    ("newsletter-inline", "custom", "all", 2, "newsletter-001"),
]

AFFILIATE_PRODUCTS = [
    ("Coursera Plus", "online_course", "Unlimited access to 7,000+ courses and professional certificates from top universities.", "https://www.coursera.org", 45, None, None, 1,
     "https://d3njjcbhbojbot.cloudfront.net/web/images/favicons/iconography/coursera-64x64.png"),
    ("edX Professional Certificates", "online_course", "Career-focused certificate programmes from MIT, Harvard and other leading institutions.", "https://www.edx.org", 35, None, None, 2,
     "https://www.edx.org/favicon.ico"),
    ("Udemy Personal Plan", "online_course", "Practical, on-demand courses covering technology, business and creative skills.", "https://www.udemy.com", 30, None, None, 3,
     "https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg"),
    ("LinkedIn Learning", "online_course", "Professional development library with expert-led business and technology courses.", "https://www.linkedin.com/learning", 25, None, None, 4,
     "https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca"),
    ("Google Career Certificates", "online_course", "Industry-recognised certificates in data analytics, UX design, IT and cybersecurity.", "https://grow.google/certificates", 20, None, None, 5,
     "https://grow.google/favicon.ico"),
    ("Chegg Study", "tool", "Textbook solutions, expert Q&A and study tools for university students.", "https://www.chegg.com", 20, None, None, 6,
     "https://www.chegg.com/favicon.ico"),
    ("Grammarly Premium", "tool", "AI-powered writing assistance for essays, applications and professional work.", "https://www.grammarly.com", 25, None, None, 7,
     "https://static.grammarly.com/assets/files/9d3f8a4b/grammarly-icon.svg"),
    ("Notion Education", "tool", "All-in-one workspace for notes, research, planning and collaboration.", "https://www.notion.so/product/notion-for-education", 20, None, None, 8, None),
    ("ScholarshipOwl", "scholarship", "Automated scholarship search and application support for students worldwide.", "https://scholarshipowl.com", 30, None, None, 9, None),
    ("Fastweb Scholarships", "scholarship", "Large scholarship matching database with personalised alerts.", "https://www.fastweb.com", 15, "USA", None, 10, None),
    ("Student Loan Hero", "tool", "Loan repayment calculators and refinancing comparison tools.", "https://studentloanhero.com", 25, "USA", None, 11, None),
    ("Credible", "tool", "Compare private student loan and refinancing offers from multiple lenders.", "https://www.credible.com", 30, "USA", None, 12, None),
    ("SoFi Student Loans", "tool", "Private student loans and refinancing with member benefits.", "https://www.sofi.com", 35, "USA", None, 13, None),
    ("LendKey", "tool", "Student loan refinancing and private loan marketplace.", "https://www.lendkey.com", 30, "USA", None, 14, None),
    ("Wise Multi-Currency Account", "tool", "Low-cost international transfers and multi-currency accounts for students abroad.", "https://wise.com", 20, None, None, 15, None),
    ("Flywire Tuition Payments", "tool", "Secure international tuition payment platform used by universities worldwide.", "https://www.flywire.com", 15, None, None, 16, None),
    ("Uniplaces Student Housing", "tool", "Verified student accommodation across Europe and beyond.", "https://www.uniplaces.com", 25, None, None, 17, None),
    ("Student.com Housing", "tool", "Global student housing marketplace with verified listings.", "https://www.student.com", 25, None, None, 18, None),
    ("Amazon Textbooks", "book", "New, used and rental textbooks with student pricing.", "https://www.amazon.com/textbooks", 8, None, None, 19, None),
    ("Bookshop.org", "book", "Online bookshop supporting independent bookstores.", "https://bookshop.org", 10, None, None, 20, None),
    ("Internshala", "tool", "Internship and online training platform for students in India and Asia.", "https://internshala.com", 25, "IND", None, 21, None),
    ("Duolingo", "tool", "Language learning for study-abroad and international career preparation.", "https://www.duolingo.com", 20, None, None, 22, None),
    ("Revolut Student", "tool", "Digital banking and currency exchange for international students.", "https://www.revolut.com", 20, None, None, 23, None),
    ("Coursera Google Data Analytics", "online_course", "Entry-level data analytics certificate designed for career changers.", "https://www.coursera.org/professional-certificates/google-data-analytics", 45, None, "data-science", 24, None),
]

LOAN_BASE = {
    "USA": 6.5, "GBR": 6.0, "CAN": 6.5, "AUS": 6.0, "DEU": 4.5,
    "FRA": 3.5, "NLD": 4.0, "IRL": 5.0, "CHE": 3.0, "SGP": 4.5,
    "JPN": 3.0, "KOR": 4.0, "CHN": 4.5, "IND": 9.0, "ARE": 5.0,
    "NZL": 6.0, "SWE": 3.5, "DNK": 3.5, "NOR": 4.0, "ITA": 4.0,
    "ESP": 4.0, "BRA": 12.0, "MEX": 10.0, "ZAF": 10.0, "TUR": 15.0,
    "POL": 6.0, "PRT": 5.0, "MYS": 5.5,
}

TOP_SEO_COUNTRIES = [
    "USA", "GBR", "CAN", "AUS", "DEU", "FRA", "NLD", "IRL", "CHE", "SGP",
    "JPN", "KOR", "CHN", "IND", "ARE", "NZL", "SWE", "DNK", "NOR", "ITA",
    "ESP", "BRA", "MEX", "ZAF", "TUR", "POL", "PRT", "MYS", "NGA", "KEN",
]

TOP_SALARY_COUNTRIES = [
    "USA", "GBR", "CAN", "AUS", "DEU", "FRA", "NLD", "IRL", "CHE", "SGP",
    "JPN", "KOR", "CHN", "IND", "ARE", "NZL", "SWE", "DNK", "NOR", "ITA",
    "ESP", "BRA", "MEX", "ZAF", "TUR", "POL", "PRT", "MYS", "NGA", "KEN",
]

CORE_DEGREE_SLUGS = ["certificate", "associate", "bachelors", "masters", "phd"]
PROGRAM_MAJORS = [
    "computer-science", "data-science", "business-administration", "finance",
    "mechanical-engineering", "electrical-engineering", "nursing", "medicine",
]


# ----------------------------------------------------------------------------
# build reference rows
# ----------------------------------------------------------------------------

def build_countries():
    rows = []
    codes = set(GDP.keys())
    # Taiwan is not covered by the World Bank API; add a benchmark row.
    if "TWN" in ML and "TWN" not in GDP:
        codes.add("TWN")
        GDP["TWN"] = 33000.0
        INCOME["TWN"] = "High income"
        HCI["TWN"] = 0.78
        EDEXP["TWN"] = 4.0

    for code in sorted(codes):
        meta = ML.get(code)
        if not meta:
            continue
        if meta.get("region") == "Antarctic":
            continue
        name = meta["name"]["common"]
        region_raw = meta.get("region", "")
        subregion = meta.get("subregion", "")
        if region_raw == "Americas":
            region = "North America" if subregion == "North America" else "Latin America & Caribbean"
        else:
            region = REGION_MAP.get(region_raw, region_raw or "Other")

        currencies = meta.get("currencies") or {}
        if not currencies:
            continue
        currency = sorted(currencies.keys())[0]

        gdp_usd = float(GDP.get(code) or 5000)
        if gdp_usd <= 0:
            gdp_usd = 5000

        nname = NUMBEO_ALIASES.get(name, name)
        if nname not in numbeo:
            nname = WB_NAME.get(code, name)
            nname = NUMBEO_ALIASES.get(nname, nname)
        col = numbeo.get(nname)
        if col:
            cost_index = col[0]
            rent_index = col[1]
            grocery_index = col[3]
        else:
            cost_index = clamp(gdp_usd ** 0.373, 12, 110)
            rent_index = cost_index * 0.45
            grocery_index = cost_index * 0.72

        income_level = INCOME.get(code, "")
        if code in AVG_TAX:
            tax = AVG_TAX[code]
        elif income_level == "High income":
            tax = 27
        elif income_level == "Upper middle income":
            tax = 20
        elif income_level == "Lower middle income":
            tax = 14
        else:
            tax = 10

        h = HCI.get(code)
        e = EDEXP.get(code, 4.0)
        if h is not None:
            edu_index = clamp(h * 100 * 0.85 + e * 2.0, 20, 99)
        else:
            edu_index = clamp(30 + math.log10(max(gdp_usd, 500)) * 12, 20, 80)

        rows.append({
            "code": code,
            "name": name,
            "region": region,
            "currency": currency,
            "tax": tax,
            "gdp": gdp_usd,
            "col": cost_index,
            "rent": rent_index,
            "grocery": grocery_index,
            "edu": round(edu_index, 2),
            "capital": (meta.get("capital") or [None])[0],
        })
    return rows


COUNTRIES = build_countries()
COUNTRY_BY_CODE = {c["code"]: c for c in COUNTRIES}

# ----------------------------------------------------------------------------
# build currencies
# ----------------------------------------------------------------------------

CURRENCY_NAMES = {
    "USD": ("US Dollar", "$"), "EUR": ("Euro", "€"), "GBP": ("British Pound", "£"),
    "JPY": ("Japanese Yen", "¥"), "CNY": ("Chinese Yuan", "¥"), "INR": ("Indian Rupee", "₹"),
    "CAD": ("Canadian Dollar", "C$"), "AUD": ("Australian Dollar", "A$"),
    "NZD": ("New Zealand Dollar", "NZ$"), "CHF": ("Swiss Franc", "CHF"),
    "SGD": ("Singapore Dollar", "S$"), "HKD": ("Hong Kong Dollar", "HK$"),
    "KRW": ("South Korean Won", "₩"), "TWD": ("New Taiwan Dollar", "NT$"),
    "AED": ("UAE Dirham", "د.إ"), "SAR": ("Saudi Riyal", "﷼"), "QAR": ("Qatari Riyal", "﷼"),
    "KWD": ("Kuwaiti Dinar", "د.ك"), "BHD": ("Bahraini Dinar", "ب.د"), "OMR": ("Omani Rial", "﷼"),
    "JOD": ("Jordanian Dinar", "د.ا"), "ILS": ("Israeli New Shekel", "₪"),
    "TRY": ("Turkish Lira", "₺"), "RUB": ("Russian Ruble", "₽"), "UAH": ("Ukrainian Hryvnia", "₴"),
    "PLN": ("Polish Zloty", "zł"), "CZK": ("Czech Koruna", "Kč"), "HUF": ("Hungarian Forint", "Ft"),
    "RON": ("Romanian Leu", "lei"), "BGN": ("Bulgarian Lev", "лв"), "RSD": ("Serbian Dinar", "дин"),
    "HRK": ("Croatian Kuna", "kn"), "SEK": ("Swedish Krona", "kr"), "NOK": ("Norwegian Krone", "kr"),
    "DKK": ("Danish Krone", "kr"), "ISK": ("Icelandic Krona", "kr"), "CHF": ("Swiss Franc", "CHF"),
    "BRL": ("Brazilian Real", "R$"), "MXN": ("Mexican Peso", "Mex$"), "ARS": ("Argentine Peso", "AR$"),
    "CLP": ("Chilean Peso", "CL$"), "COP": ("Colombian Peso", "COL$"), "PEN": ("Peruvian Sol", "S/"),
    "UYU": ("Uruguayan Peso", "$U"), "PYG": ("Paraguayan Guarani", "₲"), "BOB": ("Bolivian Boliviano", "Bs"),
    "VES": ("Venezuelan Bolivar", "Bs."), "CRC": ("Costa Rican Colon", "₡"), "PAB": ("Panamanian Balboa", "B/."),
    "DOP": ("Dominican Peso", "RD$"), "GTQ": ("Guatemalan Quetzal", "Q"), "HNL": ("Honduran Lempira", "L"),
    "NIO": ("Nicaraguan Cordoba", "C$"), "JMD": ("Jamaican Dollar", "J$"), "TTD": ("Trinidad and Tobago Dollar", "TT$"),
    "ZAR": ("South African Rand", "R"), "NGN": ("Nigerian Naira", "₦"), "KES": ("Kenyan Shilling", "KSh"),
    "GHS": ("Ghanaian Cedi", "₵"), "EGP": ("Egyptian Pound", "E£"), "MAD": ("Moroccan Dirham", "د.م."),
    "DZD": ("Algerian Dinar", "د.ج"), "TND": ("Tunisian Dinar", "د.ت"), "ETB": ("Ethiopian Birr", "Br"),
    "TZS": ("Tanzanian Shilling", "TSh"), "UGX": ("Ugandan Shilling", "USh"), "RWF": ("Rwandan Franc", "FRw"),
    "XOF": ("West African CFA Franc", "CFA"), "XAF": ("Central African CFA Franc", "FCFA"),
    "ZMW": ("Zambian Kwacha", "ZK"), "MWK": ("Malawian Kwacha", "MK"), "MZN": ("Mozambican Metical", "MT"),
    "BWP": ("Botswana Pula", "P"), "NAD": ("Namibian Dollar", "N$"), "MUR": ("Mauritian Rupee", "₨"),
    "AOA": ("Angolan Kwanza", "Kz"), "CDF": ("Congolese Franc", "FC"), "SLL": ("Sierra Leonean Leone", "Le"),
    "LRD": ("Liberian Dollar", "L$"), "GMD": ("Gambian Dalasi", "D"), "GNF": ("Guinean Franc", "FG"),
    "SEN": ("Senegalese Franc", "CFA"), "SDG": ("Sudanese Pound", "ج.س."), "LYD": ("Libyan Dinar", "ل.د"),
    "PKR": ("Pakistani Rupee", "₨"), "BDT": ("Bangladeshi Taka", "৳"), "LKR": ("Sri Lankan Rupee", "Rs"),
    "NPR": ("Nepalese Rupee", "रू"), "BTN": ("Bhutanese Ngultrum", "Nu."), "MVR": ("Maldivian Rufiyaa", "Rf"),
    "MMK": ("Myanmar Kyat", "K"), "THB": ("Thai Baht", "฿"), "VND": ("Vietnamese Dong", "₫"),
    "KHR": ("Cambodian Riel", "៛"), "LAK": ("Lao Kip", "₭"), "IDR": ("Indonesian Rupiah", "Rp"),
    "MYR": ("Malaysian Ringgit", "RM"), "PHP": ("Philippine Peso", "₱"), "BND": ("Brunei Dollar", "B$"),
    "MNT": ("Mongolian Tugrik", "₮"), "KZT": ("Kazakhstani Tenge", "₸"), "UZS": ("Uzbekistani Som", "so'm"),
    "KGS": ("Kyrgyzstani Som", "с"), "TJS": ("Tajikistani Somoni", "SM"), "TMT": ("Turkmenistani Manat", "m"),
    "AZN": ("Azerbaijani Manat", "₼"), "AMD": ("Armenian Dram", "֏"), "GEL": ("Georgian Lari", "₾"),
    "AFN": ("Afghan Afghani", "؋"), "IRR": ("Iranian Rial", "﷼"), "IQD": ("Iraqi Dinar", "ع.د"),
    "SYP": ("Syrian Pound", "£S"), "LBP": ("Lebanese Pound", "ل.ل"), "YER": ("Yemeni Rial", "﷼"),
    "MOP": ("Macanese Pataca", "MOP$"), "FJD": ("Fijian Dollar", "FJ$"), "PGK": ("Papua New Guinean Kina", "K"),
    "SBD": ("Solomon Islands Dollar", "SI$"), "VUV": ("Vanuatu Vatu", "VT"), "WST": ("Samoan Tala", "T"),
    "TOP": ("Tongan Pa'anga", "T$"), "XPF": ("CFP Franc", "₣"), "BMD": ("Bermudian Dollar", "BD$"),
    "KYD": ("Cayman Islands Dollar", "CI$"), "AWG": ("Aruban Florin", "ƒ"), "ANG": ("Netherlands Antillean Guilder", "ƒ"),
    "BSD": ("Bahamian Dollar", "B$"), "BBD": ("Barbadian Dollar", "Bds$"), "BZD": ("Belize Dollar", "BZ$"),
    "XCD": ("East Caribbean Dollar", "EC$"), "GYD": ("Guyanese Dollar", "G$"), "SRD": ("Surinamese Dollar", "Sr$"),
    "HTG": ("Haitian Gourde", "G"), "CUP": ("Cuban Peso", "₱"), "BES": ("Caribbean Guilder", "ƒ"),
    "MAD": ("Moroccan Dirham", "د.م."), "MRU": ("Mauritanian Ouguiya", "UM"), "CVE": ("Cape Verdean Escudo", "Esc"),
    "STN": ("São Tomé and Príncipe Dobra", "Db"), "GQH": ("Equatorial Guinean Ekwele", "₱"),
}


def build_currencies():
    codes = set(RATES.keys())
    for c in COUNTRIES:
        codes.add(c["currency"])
    rows = []
    for code in sorted(codes):
        rate = RATES.get(code)
        if rate is None:
            rate = 1.0
        namesym = CURRENCY_NAMES.get(code)
        if not namesym:
            # look in mledoze metadata
            found = None
            for meta in mledoze:
                cur = (meta.get("currencies") or {})
                if code in cur:
                    found = cur[code]
                    break
            if found:
                namesym = (found.get("name", code), found.get("symbol", code))
            else:
                namesym = (code, code)
        rows.append((code, namesym[0], namesym[1], rate))
    return rows


CURRENCIES = build_currencies()

# ----------------------------------------------------------------------------
# derivation helpers
# ----------------------------------------------------------------------------

def country_factor(gdp_usd: float) -> float:
    return clamp((gdp_usd / 60000.0) ** 0.45, 0.16, 1.7)


def annual_salary_usd(country_code: str, major: tuple, degree_slug: str, exp: str = "Mid") -> float:
    c = COUNTRY_BY_CODE.get(country_code)
    if not c:
        return 0
    dmult = next((d[5] for d in DEGREES if d[1] == degree_slug), 1.0)
    emult = {"Entry": 0.72, "Mid": 1.0, "Senior": 1.35}.get(exp, 1.0)
    return major[3] * country_factor(c["gdp"]) * dmult * emult


def local_amount(country_code: str, usd: float) -> float:
    c = COUNTRY_BY_CODE.get(country_code)
    rate = RATES.get(c["currency"], 1.0) if c else 1.0
    return usd * rate


def denomination(country_code: str):
    """Some currencies (e.g. IRR) overflow the schema's numeric precision when
    local amounts are stored. Denominate those rows in USD instead."""
    c = COUNTRY_BY_CODE.get(country_code)
    if not c:
        return "USD", 1.0
    rate = RATES.get(c["currency"], 1.0)
    if rate >= 50000:
        return "USD", 1.0
    return c["currency"], rate


def cap(value: float, maximum: float) -> float:
    return min(float(value), maximum)


# ----------------------------------------------------------------------------
# SQL emission
# ----------------------------------------------------------------------------

out = []
add = out.append


def emit_values(table, columns, rows, conflict="ON CONFLICT DO NOTHING", batch=400):
    if not rows:
        return
    add(f"-- {table}: {len(rows)} rows")
    cols = ", ".join(columns)
    for i in range(0, len(rows), batch):
        chunk = rows[i:i + batch]
        add(f"INSERT INTO {table} ({cols}) VALUES")
        add(",\n".join("(" + ", ".join(q(v) for v in row) + ")" for row in chunk))
        add(f"{conflict};")
    add("")


started = date.today().isoformat()
add("-- ============================================================================")
add("-- EduROI reference-data seed")
add(f"-- Generated {started} from World Bank, open.er-api, Numbeo and curated sources.")
add("-- Re-runnable: every statement is idempotent.")
add("-- ============================================================================")
add("")
add("BEGIN;")
add("SET client_encoding = 'UTF8';")
add("")
add("-- Idempotency guards for tables without natural unique constraints.")
add("CREATE UNIQUE INDEX IF NOT EXISTS uq_cost_of_living_country_city_year")
add("    ON cost_of_living (country_id, COALESCE(city, ''), year);")
add("CREATE UNIQUE INDEX IF NOT EXISTS uq_salary_stats_combo")
add("    ON salary_statistics (country_id, major_id, degree_level_id, experience_level, year);")
add("CREATE UNIQUE INDEX IF NOT EXISTS uq_tax_rules_country_bracket_year")
add("    ON tax_rules (country_id, income_bracket_min, year);")
add("CREATE UNIQUE INDEX IF NOT EXISTS uq_loan_rules_country_type")
add("    ON loan_rules (country_id, loan_type);")
add("CREATE UNIQUE INDEX IF NOT EXISTS uq_faqs_page_order")
add("    ON faqs (seo_page_id, display_order);")
add("CREATE UNIQUE INDEX IF NOT EXISTS uq_affiliate_product_name")
add("    ON affiliate_products (name);")
add("")

# ---------------- currencies ----------------
now = "NOW()"
cur_rows = []
for code, name, symbol, rate in CURRENCIES:
    cur_rows.append((code, name, symbol, round(rate, 6), now, now, now))
emit_values(
    "currencies",
    ["code", "name", "symbol", "exchange_rate_to_usd", "last_updated", "created_at", "updated_at"],
    cur_rows,
    conflict=("ON CONFLICT (code) DO UPDATE SET "
              "name = EXCLUDED.name, symbol = EXCLUDED.symbol, "
              "exchange_rate_to_usd = EXCLUDED.exchange_rate_to_usd, "
              "last_updated = EXCLUDED.last_updated, updated_at = NOW()"),
)

# ---------------- countries ----------------
country_rows = []
for c in COUNTRIES:
    country_rows.append((
        c["code"], c["name"], c["region"], c["currency"],
        num(c["tax"]), num(c["gdp"]), num(c["col"]), num(c["edu"]),
        "TRUE", now, now,
    ))
emit_values(
    "countries",
    ["code", "name", "region", "currency_code", "avg_tax_rate", "gdp_per_capita",
     "cost_of_living_index", "education_quality_index", "is_active", "created_at", "updated_at"],
    country_rows,
    conflict=("ON CONFLICT (code) DO UPDATE SET "
              "avg_tax_rate = EXCLUDED.avg_tax_rate, "
              "gdp_per_capita = EXCLUDED.gdp_per_capita, "
              "cost_of_living_index = EXCLUDED.cost_of_living_index, "
              "education_quality_index = EXCLUDED.education_quality_index, "
              "is_active = TRUE, updated_at = NOW()"),
)

# ---------------- majors ----------------
major_rows = []
for name, category, desc, salary, growth, demand in MAJORS:
    major_rows.append((name, slugify(name), category, desc, num(salary), num(growth), demand, "TRUE", now, now))
emit_values(
    "majors",
    ["name", "slug", "category", "description", "avg_global_salary",
     "job_growth_rate", "demand_score", "is_active", "created_at", "updated_at"],
    major_rows,
    conflict="ON CONFLICT (slug) DO NOTHING",
)

# ---------------- degree levels ----------------
degree_rows = []
for name, slug, duration, desc, level, _mult in DEGREES:
    degree_rows.append((name, slug, duration, desc, level, now, now))
emit_values(
    "degree_levels",
    ["name", "slug", "typical_duration_years", "description", "education_level", "created_at", "updated_at"],
    degree_rows,
    conflict="ON CONFLICT (slug) DO NOTHING",
)

# ---------------- universities ----------------
uni_rows = []
for (name, ccode, city, utype, rank, tuition_usd, acceptance, graduation, website) in UNIVERSITIES:
    c = COUNTRY_BY_CODE.get(ccode)
    if not c:
        continue
    denom_currency, rate = denomination(ccode)
    local_tuition = cap(tuition_usd * rate, 9_999_999_999.99)
    uni_rows.append((
        name, slugify(name), ccode, city, utype, rank,
        num(local_tuition), denom_currency, num(acceptance), num(graduation),
        website, "TRUE", now, now,
    ))
add("-- universities are inserted through a values table so the country FK can be resolved by code")
add("CREATE TEMP TABLE _seed_university (")
add("    name text, slug text, country_code text, city text, type text, ranking int,")
add("    tuition numeric, currency_code text, acceptance numeric, graduation numeric,")
add("    website text, is_active boolean")
add(") ON COMMIT DROP;")
add("")
for i in range(0, len(uni_rows), 300):
    chunk = uni_rows[i:i + 300]
    add("INSERT INTO _seed_university VALUES")
    add(",\n".join("(" + ", ".join(q(v) for v in row[:12]) + ")" for row in chunk) + ";")
add("")
add("INSERT INTO universities (name, slug, country_id, city, type, ranking, avg_tuition_annual,")
add("                          currency_code, acceptance_rate, graduation_rate, website_url, is_active, created_at, updated_at)")
add("SELECT s.name, s.slug, c.id, s.city, s.type, s.ranking, s.tuition,")
add("       s.currency_code, s.acceptance, s.graduation, s.website, s.is_active, NOW(), NOW()")
add("FROM _seed_university s JOIN countries c ON c.code = s.country_code")
add("ON CONFLICT (slug) DO NOTHING;")
add("")

# ---------------- cost of living ----------------
col_rows = []
for c in COUNTRIES:
    denom_currency, rate = denomination(c["code"])
    # Baseline is expressed in USD, then converted to the row's denomination.
    rent = c["rent"] * 40.0
    food = c["grocery"] * 9.0
    transport = c["col"] * 3.0
    utilities = c["col"] * 2.2
    other = c["col"] * 7.0
    total = rent + food + transport + utilities + other
    col_rows.append((
        c["code"], None, denom_currency,
        num(cap(rent * rate, 99_999_999.99)), num(cap(food * rate, 99_999_999.99)),
        num(cap(transport * rate, 99_999_999.99)),
        num(cap(utilities * rate, 99_999_999.99)), num(cap(other * rate, 99_999_999.99)),
        num(cap(total * rate, 99_999_999.99)), YEAR,
    ))

# Capital-city rows for a richer dataset.
CITY_MULT = 1.16
for c in COUNTRIES:
    if not c["capital"] or c["code"] not in TOP_SEO_COUNTRIES:
        continue
    denom_currency, rate = denomination(c["code"])
    rent = c["rent"] * 40.0 * 1.28
    food = c["grocery"] * 9.0 * 1.12
    transport = c["col"] * 3.0 * 1.15
    utilities = c["col"] * 2.2 * 1.10
    other = c["col"] * 7.0 * CITY_MULT
    total = rent + food + transport + utilities + other
    col_rows.append((
        c["code"], c["capital"][:100], denom_currency,
        num(cap(rent * rate, 99_999_999.99)), num(cap(food * rate, 99_999_999.99)),
        num(cap(transport * rate, 99_999_999.99)),
        num(cap(utilities * rate, 99_999_999.99)), num(cap(other * rate, 99_999_999.99)),
        num(cap(total * rate, 99_999_999.99)), YEAR,
    ))

add("-- cost_of_living is inserted through a values table so the country FK can be resolved by code")
add("CREATE TEMP TABLE _seed_col (")
add("    country_code text, city text, currency_code text, rent numeric, food numeric,")
add("    transport numeric, utilities numeric, other numeric, total numeric, year int")
add(") ON COMMIT DROP;")
for i in range(0, len(col_rows), 300):
    chunk = col_rows[i:i + 300]
    add("INSERT INTO _seed_col VALUES")
    add(",\n".join("(" + ", ".join(q(v) for v in row) + ")" for row in chunk) + ";")
add("")
add("INSERT INTO cost_of_living (country_id, city, currency_code, rent_monthly_avg, food_monthly_avg,")
add("                             transportation_monthly_avg, utilities_monthly_avg, other_expenses_monthly_avg,")
add("                             total_monthly_avg, year, created_at, updated_at)")
add("SELECT c.id, s.city, s.currency_code, s.rent, s.food, s.transport, s.utilities, s.other,")
add("       s.total, s.year, NOW(), NOW()")
add("FROM _seed_col s JOIN countries c ON c.code = s.country_code")
add("ON CONFLICT DO NOTHING;")
add("")

# ---------------- salary statistics ----------------
salary_rows = []
for c in COUNTRIES:
    denom_currency, rate = denomination(c["code"])
    for major in MAJORS:
        for dslug in CORE_DEGREE_SLUGS:
            avg_usd = annual_salary_usd(c["code"], major, dslug, "Mid")
            if avg_usd <= 0:
                continue
            salary_rows.append((
                c["code"], slugify(major[0]), dslug, "Mid",
                num(cap(avg_usd * 0.78 * rate, 9_999_999_999.99)),
                num(cap(avg_usd * rate, 9_999_999_999.99)),
                num(cap(avg_usd * 1.35 * rate, 9_999_999_999.99)),
                denom_currency, YEAR, "World Bank GDP-adjusted model + EduROI benchmarks",
            ))
for code in TOP_SALARY_COUNTRIES:
    c = COUNTRY_BY_CODE.get(code)
    if not c:
        continue
    denom_currency, rate = denomination(code)
    for major in MAJORS:
        for dslug in CORE_DEGREE_SLUGS:
            for exp in ("Entry", "Senior"):
                avg_usd = annual_salary_usd(code, major, dslug, exp)
                if avg_usd <= 0:
                    continue
                salary_rows.append((
                    code, slugify(major[0]), dslug, exp,
                    num(cap(avg_usd * 0.78 * rate, 9_999_999_999.99)),
                    num(cap(avg_usd * rate, 9_999_999_999.99)),
                    num(cap(avg_usd * 1.35 * rate, 9_999_999_999.99)),
                    denom_currency, YEAR, "World Bank GDP-adjusted model + EduROI benchmarks",
                ))

add("-- salary_statistics is inserted through a values table for efficient FK resolution")
add("CREATE TEMP TABLE _seed_salary (")
add("    country_code text, major_slug text, degree_slug text, experience text,")
add("    salary_min numeric, salary_avg numeric, salary_max numeric,")
add("    currency_code text, year int, source text")
add(") ON COMMIT DROP;")
for i in range(0, len(salary_rows), 500):
    chunk = salary_rows[i:i + 500]
    add("INSERT INTO _seed_salary VALUES")
    add(",\n".join("(" + ", ".join(q(v) for v in row) + ")" for row in chunk) + ";")
add("")
add("INSERT INTO salary_statistics (country_id, major_id, degree_level_id, experience_level,")
add("                                salary_min, salary_avg, salary_max, currency_code, year, source, created_at, updated_at)")
add("SELECT c.id, m.id, d.id, s.experience, s.salary_min, s.salary_avg, s.salary_max,")
add("       s.currency_code, s.year, s.source, NOW(), NOW()")
add("FROM _seed_salary s")
add("JOIN countries c ON c.code = s.country_code")
add("JOIN majors m ON m.slug = s.major_slug")
add("JOIN degree_levels d ON d.slug = s.degree_slug")
add("ON CONFLICT DO NOTHING;")
add("")

# ---------------- tax rules ----------------
tax_rows = []
for c in COUNTRIES:
    denom_currency, rate_unit = denomination(c["code"])
    gdp_local = c["gdp"] * rate_unit
    avg = c["tax"]
    top = clamp(avg * 1.45, 0, 55)
    brackets = [
        (0, gdp_local * 0.5, top * 0.25),
        (gdp_local * 0.5, gdp_local * 1.5, top * 0.60),
        (gdp_local * 1.5, gdp_local * 3.0, top * 0.85),
        (gdp_local * 3.0, None, top),
    ]
    for lo, hi, tr in brackets:
        tax_rows.append((
            c["code"], num(lo), num(hi) if hi is not None else "NULL",
            num(round(tr, 2)), "TRUE", YEAR,
        ))
add("CREATE TEMP TABLE _seed_tax (")
add("    country_code text, bracket_min numeric, bracket_max numeric, tax_rate numeric,")
add("    is_progressive boolean, year int")
add(") ON COMMIT DROP;")
for i in range(0, len(tax_rows), 400):
    chunk = tax_rows[i:i + 400]
    add("INSERT INTO _seed_tax VALUES")
    add(",\n".join("(" + ", ".join(q(v) for v in row) + ")" for row in chunk) + ";")
add("")
add("INSERT INTO tax_rules (country_id, income_bracket_min, income_bracket_max, tax_rate, is_progressive, year, created_at, updated_at)")
add("SELECT c.id, s.bracket_min, s.bracket_max, s.tax_rate, s.is_progressive, s.year, NOW(), NOW()")
add("FROM _seed_tax s JOIN countries c ON c.code = s.country_code")
add("ON CONFLICT DO NOTHING;")
add("")

# ---------------- loan rules ----------------
loan_rows = []
for code, base in LOAN_BASE.items():
    loan_rows.append((code, "Government / Federal Student Loan",
                      num(max(0.0, base - 2.0)), num(base + 1.0), 15, 6, "TRUE"))
    loan_rows.append((code, "Private Education Loan",
                      num(base + 2.0), num(base + 6.0), 10, 6, "FALSE"))
add("CREATE TEMP TABLE _seed_loan (")
add("    country_code text, loan_type text, rate_min numeric, rate_max numeric,")
add("    repayment_years int, grace_months int, is_subsidized boolean")
add(") ON COMMIT DROP;")
add("INSERT INTO _seed_loan VALUES")
add(",\n".join("(" + ", ".join(q(v) for v in row) + ")" for row in loan_rows) + ";")
add("")
add("INSERT INTO loan_rules (country_id, loan_type, interest_rate_min, interest_rate_max,")
add("                         repayment_period_years, grace_period_months, is_subsidized, created_at, updated_at)")
add("SELECT c.id, s.loan_type, s.rate_min, s.rate_max, s.repayment_years, s.grace_months,")
add("       s.is_subsidized, NOW(), NOW()")
add("FROM _seed_loan s JOIN countries c ON c.code = s.country_code")
add("ON CONFLICT DO NOTHING;")
add("")

# ---------------- university programs ----------------
prog_rows = []
for (name, ccode, city, utype, rank, tuition_usd, acceptance, graduation, website) in UNIVERSITIES:
    c = COUNTRY_BY_CODE.get(ccode)
    if not c:
        continue
    denom_currency, rate = denomination(ccode)
    for mslug in PROGRAM_MAJORS:
        major = next((m for m in MAJORS if slugify(m[0]) == mslug), None)
        if not major:
            continue
        for dslug, factor, duration in (("bachelors", 1.0, 4), ("masters", 1.15, 2)):
            tuition_local = cap(tuition_usd * rate * factor, 9_999_999_999.99)
            avg_salary_usd = annual_salary_usd(ccode, major, dslug, "Mid")
            employment = clamp(96 - rank / 40.0, 78, 97)
            prog_rows.append((
                slugify(name), ccode, dslug, mslug, num(tuition_local), denom_currency,
                num(duration, 1), num(employment),
                num(cap(avg_salary_usd * rate, 9_999_999_999.99)), "TRUE",
            ))

add("CREATE TEMP TABLE _seed_program (")
add("    university_slug text, country_code text, degree_slug text, major_slug text,")
add("    tuition numeric, currency_code text, duration numeric, employment numeric,")
add("    grad_salary numeric, is_active boolean")
add(") ON COMMIT DROP;")
for i in range(0, len(prog_rows), 500):
    chunk = prog_rows[i:i + 500]
    add("INSERT INTO _seed_program VALUES")
    add(",\n".join("(" + ", ".join(q(v) for v in row) + ")" for row in chunk) + ";")
add("")
add("INSERT INTO university_programs (university_id, major_id, degree_level_id, tuition_annual,")
add("                                  currency_code, duration_years, employment_rate,")
add("                                  avg_graduate_salary, is_active, created_at, updated_at)")
add("SELECT u.id, m.id, d.id, s.tuition, s.currency_code, s.duration, s.employment,")
add("       s.grad_salary, s.is_active, NOW(), NOW()")
add("FROM _seed_program s")
add("JOIN universities u ON u.slug = s.university_slug")
add("JOIN majors m ON m.slug = s.major_slug")
add("JOIN degree_levels d ON d.slug = s.degree_slug")
add("ON CONFLICT (university_id, major_id, degree_level_id) DO NOTHING;")
add("")

# ---------------- SEO pages ----------------
seo_rows = []
faq_rows = []
major_by_slug = {slugify(m[0]): m for m in MAJORS}
degree_by_slug = {d[1]: d for d in DEGREES}

for code in TOP_SEO_COUNTRIES:
    c = COUNTRY_BY_CODE.get(code)
    if not c:
        continue
    for mslug, m in major_by_slug.items():
        slug = f"roi-{code.lower()}-{mslug}"
        title = f"Is {m[0]} Worth It in {c['name']}? ROI & Salary ({YEAR}) | EduROI"
        description = (
            f"Calculate the return on investment for a {m[0]} degree in {c['name']}. "
            f"See tuition, living costs, expected salary, break-even years and long-term ROI."
        )
        h1 = f"Is {m[0]} Worth It in {c['name']}?"
        seo_rows.append((slug, "country_major", title[:200], description[:500], h1[:200],
                         code, mslug, "bachelors"))
        faq_rows.append((
            slug, 1,
            f"How is the ROI for {m[0]} in {c['name']} calculated?",
            f"EduROI compares the total cost of a {m[0]} degree in {c['name']} — tuition, "
            f"living costs, loan interest and opportunity cost — with the projected lifetime "
            f"earnings uplift. The result is expressed as net ROI, ROI percentage and break-even years.",
            "ROI",
        ))
        salary_local = local_amount(code, annual_salary_usd(code, m, "bachelors", "Mid"))
        faq_rows.append((
            slug, 2,
            f"What salary can I expect after studying {m[0]} in {c['name']}?",
            f"Graduates of {m[0]} programmes in {c['name']} typically earn around "
            f"{salary_local:,.0f} {c['currency']} per year at the mid-career level. "
            f"Entry-level pay is usually lower and senior roles can be significantly higher.",
            "Salary",
        ))

for code in TOP_SEO_COUNTRIES:
    c = COUNTRY_BY_CODE.get(code)
    if not c:
        continue
    for dslug in ("certificate", "associate", "bachelors", "masters", "phd"):
        d = degree_by_slug[dslug]
        slug = f"degree-{code.lower()}-{dslug}"
        title = f"{d[0]} in {c['name']}: Cost, Salary & ROI ({YEAR}) | EduROI"
        description = (
            f"How much does a {d[0]} cost in {c['name']} and what is it worth? "
            f"Compare tuition, duration, salaries and return on investment."
        )
        h1 = f"{d[0]} in {c['name']}: Is It Worth It?"
        seo_rows.append((slug, "country_degree", title[:200], description[:500], h1[:200],
                         code, None, dslug))
        faq_rows.append((
            slug, 1,
            f"How long does a {d[0]} take in {c['name']}?",
            f"A {d[0]} typically takes {d[2]} year(s) of full-time study. "
            f"Part-time and accelerated routes may vary by institution.",
            "Duration",
        ))
        faq_rows.append((
            slug, 2,
            f"What is the average salary after a {d[0]} in {c['name']}?",
            f"Salary outcomes depend on the field of study and institution. "
            f"Use the EduROI calculator to model a specific major and university in {c['name']}.",
            "Salary",
        ))

add("-- Remove legacy slash-delimited SEO slugs that the /page/:slug route cannot serve.")
add("DELETE FROM faqs WHERE seo_page_id IN (SELECT id FROM seo_pages WHERE slug LIKE '%/%');")
add("DELETE FROM seo_pages WHERE slug LIKE '%/%';")
add("")
add("CREATE TEMP TABLE _seed_seo (")
add("    slug text, page_type text, meta_title text, meta_description text, h1_title text,")
add("    country_code text, major_slug text, degree_slug text")
add(") ON COMMIT DROP;")
for i in range(0, len(seo_rows), 300):
    chunk = seo_rows[i:i + 300]
    add("INSERT INTO _seed_seo VALUES")
    add(",\n".join("(" + ", ".join(q(v) for v in row) + ")" for row in chunk) + ";")
add("")
add("INSERT INTO seo_pages (slug, page_type, meta_title, meta_description, h1_title, canonical_url,")
add("                         country_id, major_id, degree_level_id, default_params,")
add("                         view_count, calculation_count, is_published, created_at, updated_at)")
add("SELECT s.slug, s.page_type, s.meta_title, s.meta_description, s.h1_title,")
add("       'https://eduroi.com/page/' || s.slug, c.id, m.id, d.id,")
add("       jsonb_strip_nulls(jsonb_build_object(")
add("           'countryCode', c.code, 'majorId', m.id, 'degreeLevelId', d.id,")
add("           'tuitionAnnual', round(c.gdp_per_capita * 0.22 * fx.m / 100) * 100,")
add("           'livingCostAnnual', round(CASE WHEN col.total_monthly_avg IS NOT NULL")
add("               THEN col.total_monthly_avg * 12")
add("               ELSE c.gdp_per_capita * 0.3 * fx.m END),")
add("           'durationYears', d.typical_duration_years,")
add("           'expectedSalaryAfter', round(COALESCE(sal.salary_avg, c.gdp_per_capita * fx.m)),")
add("           'currencyCode', fx.cur)),")
add("       0, 0, TRUE, NOW(), NOW()")
add("FROM _seed_seo s")
add("JOIN countries c ON c.code = s.country_code")
add("LEFT JOIN majors m ON m.slug = s.major_slug")
add("LEFT JOIN degree_levels d ON d.slug = s.degree_slug")
add("LEFT JOIN currencies cr ON cr.code = c.currency_code")
add("LEFT JOIN LATERAL (")
add("    SELECT CASE WHEN COALESCE(cr.exchange_rate_to_usd, 1) >= 50000 THEN 1")
add("                ELSE COALESCE(cr.exchange_rate_to_usd, 1) END AS m,")
add("           CASE WHEN COALESCE(cr.exchange_rate_to_usd, 1) >= 50000 THEN 'USD'")
add("                ELSE c.currency_code END AS cur")
add(") fx ON TRUE")
add("LEFT JOIN LATERAL (")
add("    SELECT total_monthly_avg FROM cost_of_living x")
add("    WHERE x.country_id = c.id AND x.city IS NULL AND x.year = 2025")
add("    ORDER BY x.id LIMIT 1")
add(") col ON TRUE")
add("LEFT JOIN LATERAL (")
add("    SELECT ss.salary_avg FROM salary_statistics ss")
add("    WHERE ss.country_id = c.id AND ss.major_id = m.id AND ss.degree_level_id = d.id")
add("    ORDER BY ss.year DESC LIMIT 1")
add(") sal ON TRUE")
add("ON CONFLICT (slug) DO UPDATE SET")
add("    default_params = EXCLUDED.default_params")
add("WHERE seo_pages.default_params IS NULL")
add("   OR seo_pages.default_params ? 'country'")
add("   OR seo_pages.default_params ? 'major'")
add("   OR seo_pages.default_params ? 'degree';")
add("")

add("CREATE TEMP TABLE _seed_faq (")
add("    slug text, display_order int, question text, answer text, category text")
add(") ON COMMIT DROP;")
for i in range(0, len(faq_rows), 300):
    chunk = faq_rows[i:i + 300]
    add("INSERT INTO _seed_faq VALUES")
    add(",\n".join("(" + ", ".join(q(v) for v in row) + ")" for row in chunk) + ";")
add("")
add("INSERT INTO faqs (seo_page_id, question, answer, display_order, category, created_at, updated_at)")
add("SELECT p.id, s.question, s.answer, s.display_order, s.category, NOW(), NOW()")
add("FROM _seed_faq s JOIN seo_pages p ON p.slug = s.slug")
add("ON CONFLICT DO NOTHING;")
add("")

# ---------------- ad zones ----------------
ad_rows = []
for zone_name, zone_type, page_type, priority, ad_unit in AD_ZONES:
    ad_rows.append((zone_name, zone_type, page_type, priority, ad_unit, "TRUE", now, now))
emit_values(
    "ad_zones",
    ["zone_name", "zone_type", "page_type", "priority", "ad_unit_id", "is_active", "created_at", "updated_at"],
    ad_rows,
    conflict="ON CONFLICT (zone_name) DO NOTHING",
)

# ---------------- affiliate products ----------------
aff_rows = []
for (name, ptype, desc, url, commission, country, major_slug, priority, image) in AFFILIATE_PRODUCTS:
    aff_rows.append((ptype, name, desc, url, num(commission), country, major_slug, priority, "TRUE", image, now, now))
add("CREATE TEMP TABLE _seed_affiliate (")
add("    product_type text, name text, description text, affiliate_url text, commission numeric,")
add("    country_code text, major_slug text, display_priority int, is_active boolean,")
add("    image_url text")
add(") ON COMMIT DROP;")
add("INSERT INTO _seed_affiliate VALUES")
add(",\n".join("(" + ", ".join(q(v) for v in row[:10]) + ")" for row in aff_rows) + ";")
add("")
add("INSERT INTO affiliate_products (product_type, name, description, affiliate_url, commission_rate,")
add("                                  country_id, major_id, display_priority, is_active, image_url,")
add("                                  created_at, updated_at)")
add("SELECT s.product_type, s.name, s.description, s.affiliate_url, s.commission,")
add("       c.id, m.id, s.display_priority, s.is_active, s.image_url, NOW(), NOW()")
add("FROM _seed_affiliate s")
add("LEFT JOIN countries c ON c.code = s.country_code")
add("LEFT JOIN majors m ON m.slug = s.major_slug")
add("ON CONFLICT (name) DO NOTHING;")
add("")

# ---------------- finish ----------------
add("COMMIT;")
add("")
add("-- Summary")
add("SELECT")
add("    (SELECT count(*) FROM countries)          AS countries,")
add("    (SELECT count(*) FROM currencies)         AS currencies,")
add("    (SELECT count(*) FROM majors)             AS majors,")
add("    (SELECT count(*) FROM degree_levels)      AS degree_levels,")
add("    (SELECT count(*) FROM universities)       AS universities,")
add("    (SELECT count(*) FROM university_programs) AS university_programs,")
add("    (SELECT count(*) FROM cost_of_living)     AS cost_of_living,")
add("    (SELECT count(*) FROM salary_statistics)  AS salary_statistics,")
add("    (SELECT count(*) FROM tax_rules)          AS tax_rules,")
add("    (SELECT count(*) FROM loan_rules)         AS loan_rules,")
add("    (SELECT count(*) FROM seo_pages)          AS seo_pages,")
add("    (SELECT count(*) FROM faqs)               AS faqs,")
add("    (SELECT count(*) FROM ad_zones)           AS ad_zones,")
add("    (SELECT count(*) FROM affiliate_products) AS affiliate_products;")

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text("\n".join(out) + "\n", encoding="utf-8")

print(f"Wrote {OUT}")
print(f"  countries              {len(COUNTRIES)}")
print(f"  currencies             {len(CURRENCIES)}")
print(f"  majors                 {len(MAJORS)}")
print(f"  degree levels          {len(DEGREES)}")
print(f"  universities           {len(uni_rows)}")
print(f"  university programs    {len(prog_rows)}")
print(f"  cost of living         {len(col_rows)}")
print(f"  salary statistics      {len(salary_rows)}")
print(f"  tax rules              {len(tax_rows)}")
print(f"  loan rules             {len(loan_rows)}")
print(f"  seo pages              {len(seo_rows)}")
print(f"  faqs                   {len(faq_rows)}")
print(f"  ad zones               {len(AD_ZONES)}")
print(f"  affiliate products     {len(AFFILIATE_PRODUCTS)}")
print(f"  file size              {OUT.stat().st_size / 1024 / 1024:.1f} MB")
