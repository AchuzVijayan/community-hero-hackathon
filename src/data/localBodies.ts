export interface LocalBody {
  id: string;
  name: string;
  type: "Corporation" | "Municipality" | "Panchayat";
}

const KERALA_LOCAL_BODIES: Record<string, { corps: string[]; munis: string[]; panchs: string[] }> = {
  thiruvananthapuram: {
    corps: ["Thiruvananthapuram"],
    munis: ["Attingal", "Nedumangad", "Neyyattinkara", "Varkala"],
    panchs: [
      "Parassala", "Karode", "Kulathoor", "Chenkal", "Thirupuram", "Poovar", "Vellarada", "Kunnathukal", "Kollayil",
      "Perumkadavila", "Aryankode", "Ottasekaramangalam", "Kallikkadu", "Amboori", "Athiyannoor", "Kanjiramkulam",
      "Karumkulam", "Kottukal", "Venganoor", "Maranallur", "Balaramapuram", "Pallichal", "Malayinkeezhu", "Vilappil",
      "Vilavoorkal", "Kalliyoor", "Andoorkonam", "Kadinamkulam", "Mangalapuram", "Pothencode", "Azhoor", "Kattakada",
      "Vellanad", "Poovachal", "Aryanad", "Vithura", "Kuttichal", "Uzhamalakkal", "Tholicode", "Karakulam", "Aruvikkara",
      "Vembayam", "Anadu", "Panavoor", "Vamanapuram", "Manickal", "Nellanad", "Pullampara", "Nanniyode", "Peringammala",
      "Kallara", "Pangode", "Pulimath", "Karavaram", "Nagaroor", "Pazhayakunnummel", "Kilimanoor", "Navayikulam",
      "Madavoor", "Pallikkal", "Anchuthengu", "Vakkom", "Chirayinkeezhu", "Kizhuvilam", "Mudakkal", "Kadakkavoor",
      "Vettoor", "Cherunniyoor", "Edava", "Elakamon", "Chemmaruthy", "Manamboor", "Ottoor"
    ]
  },
  kollam: {
    corps: ["Kollam"],
    munis: ["Karunagappally", "Paravoor", "Punalur", "Kottarakkara"],
    panchs: [
      "Oachira", "Kulasekharapuram", "Thazhava", "Clappana", "Alappad", "Thodiyoor", "Sasthamcotta", "West Kallada",
      "Sooranad South", "Poruvazhi", "Kunnathur", "Sooranad North", "Mynagappally", "Ummannoor", "Vettikavala", "Melila",
      "Mylom", "Kulakkada", "Pavithreswaram", "Vilakkudy", "Thalavoor", "Piravanthur", "Pattazhi Vadakkekara", "Pattazhi",
      "Pathanapuram", "Kulathupuzha", "Yeroor", "Alayaman", "Anchal", "Edamulakkal", "Karavaloor", "Thenmala",
      "Aryankavu", "Veliyam", "Pooyappally", "Kareepra", "Ezhukone", "Neduvathur", "Thrikkaruva", "Panayam", "Perinad",
      "Kundara", "Perayam", "East Kallada", "Mandrothuruthu", "Thekkumbhagam", "Chavara", "Thevalakkara", "Panmana",
      "Neendakara", "Mayyanad", "Elampalloor", "Thrikkovilvattom", "Kottamkara", "Nedumpana", "Chithara", "Kadakkal",
      "Chadayamangalam", "Ittiva", "Velinalloor", "Elamadu", "Nilamel", "Kummil", "Poothakkulam", "Kalluvathukkal",
      "Chathannur", "Adichanalloor", "Chirakkara"
    ]
  },
  pathanamthitta: {
    corps: [],
    munis: ["Adoor", "Pathanamthitta", "Thiruvalla", "Pandalam"],
    panchs: [
      "Anikkadu", "Kaviyoor", "Kottanad", "Kallooppara", "Kottangal", "Kunnanthanam", "Mallappally", "Kadapra",
      "Kuttoor", "Niranam", "Nedumpram", "Peringara", "Ayiroor", "Eraviperoor", "Koipram", "Thottappuzhassery",
      "Ezhumattoor", "Puramattam", "Omalloor", "Chenneerkara", "Elanthoor", "Cherukol", "Kozhanchery", "Mallappuzhassery",
      "Naranganam", "Ranni Pazhavangady", "Ranni", "Ranny Angady", "Ranny Perunadu", "Vadasserikkara", "Chittar",
      "Seethathodu", "Naranammoozhy", "Vechoochira", "Konni", "Aruvappulam", "Pramadam", "Mylapra", "Pallickal",
      "Vallikkodu", "Thannithodu", "Malayalapuzha", "Panthalam-Thekkekkara", "Thumpamon", "Kulanada", "Aranmula",
      "Mezhuvely", "Enadimangalam", "Earathu", "Ezhamkulam", "Kadambanad", "Kalanjoor", "Kodumon"
    ]
  },
  alappuzha: {
    corps: [],
    munis: ["Alappuzha", "Chengannur", "Cherthala", "Kayamkulam", "Mavelikkara", "Haripad"],
    panchs: [
      "Arookutty", "Chennam Pallippuram", "Panavally", "Perumbalam", "Thycattussery", "Aroor", "Ezhupunna",
      "Kuthiathode", "Kodamthuruth", "Thuravoor", "Pattanakkad", "Vayalar", "Kanjikkuzhy", "Cherthala South",
      "Mararikkulam North", "Kadakkarapally", "Thanneermukkam", "Aryad", "Mannanchery", "Mararikkulam South",
      "Muhamma", "Ambalappuzha South", "Ambalappuzha North", "Punnapra South", "Punnapra North", "Purakkad",
      "Edathua", "Kainakary", "Champakkulam", "Thakazhy", "Thalavady", "Nedumudi", "Kavalam", "Pulincunnu",
      "Neelamperoor", "Muttar", "Ramankary", "Veliyanad", "Cheriyanad", "Ala", "Puliyur", "Budhannur", "Pandanad",
      "Thiruvanvandoor", "Mulakkuzha", "Venmony", "Karthikapally", "Thrikkunnappuzha", "Kumarapuram", "Karuvatta",
      "Pallippad", "Cheruthana", "Veeyapuram", "Mavelikkara Thekkekkara", "Chettikulangara", "Chennithala Thripperuthura",
      "Thazhakkara", "Mannar", "Chunakkara", "Nooranad", "Palamel", "Bharanikkavu", "Mavelikkara -Thamarakkulam",
      "Vallikunnam", "Pathiyoor", "Kandalloor", "Cheppad", "Muthukulam", "Aarattupuzha", "Krishnapuram", "Devikulangara",
      "Chingoli"
    ]
  },
  kottayam: {
    corps: [],
    munis: ["Changanassery", "Kottayam", "Palai", "Vaikom", "Ettumanoor", "Erattupetta"],
    panchs: [
      "Thalayazham", "Chempu", "Maravanthuruthu", "T V Puram", "Vechoor", "Udayanapuram", "Kaduthuruthy", "Kallara",
      "Mulakkulam", "Njeezhoor", "Thalayolaparambu", "Velloor", "Neendoor", "Kumarakom", "Thiruvarppu", "Arpookkara",
      "Athirampuzha", "Aymanam", "Kadaplamattom", "Marangattupally", "Kanakkary", "Veliyannoor", "Kuravilangadu",
      "Uzhavoor", "Ramapuram", "Manjoor", "Bharananganam", "Karoor", "Kozhuvanal", "Kadanadu", "Meenachil", "Mutholy",
      "Melukavu", "Moonnilavu", "Poonjar", "Poonjar Thekkekkara", "Teekoy", "Thalanadu", "Thalappalam", "Thidanadu",
      "Akalakkunnam", "Elikkulam", "Kooroppada", "Pampady", "Pallickathodu", "Manarcadu", "Kidangoor", "Meenadom",
      "Madappally", "Paippadu", "Thrikkodithanam", "Vakathanam", "Vazhappally", "Chirakkadavu", "Kangazha",
      "Nedumkunnam", "Vellavoor", "Vazhoor", "Karukachal", "Manimala", "Erumely", "Kanjirappally", "Koottickal",
      "Mundakayam", "Koruthode", "Parathodu", "Kurichy", "Panachikadu", "Puthuppally", "Vijayapuram", "Ayarkunnam"
    ]
  },
  idukki: {
    corps: [],
    munis: ["Thodupuzha", "Kattappana"],
    panchs: [
      "Adimali", "Konnathady", "Baisonvalley", "Vellathooval", "Pallivasal", "Marayoor", "Munnar", "Kanthalloor",
      "Vattavada", "Santhanpara", "Chinnakanal", "Mankulam", "Devikulam", "Edamalakudy", "Pampadumpara", "Senapathy",
      "Rajakkad", "Nedumkandom", "Udumbanchola", "Rajakumary", "Vannappuram", "Udumbannoor", "Kodikulam", "Alakode",
      "Velliyamattom", "Karimannoor", "Kudayathoor", "Idukki-Kanjikuzhy", "Vathikudy", "Arakulam", "Kamakshy",
      "Vazhathope", "Mariyapuram", "Upputhara", "Vandanmedu", "Kanchiyar", "Erattayar", "Ayyappancoil", "Chakkupallam",
      "Kumaramangalam", "Muttom", "Edavetty", "Karimkunnam", "Manakkad", "Purapuzha", "Peruvanthanam", "Kumily",
      "Kokkayar", "Peermade", "Elappara", "Vandiperiyar"
    ]
  },
  ernakulam: {
    corps: ["Kochi"],
    munis: [
      "Aluva", "Angamaly", "Eloor", "Kalamassery", "Kothamangalam", "Maradu", "Muvattupuzha", "North Paravur",
      "Perumbavoor", "Thrikkakara", "Thripunithura", "Piravom", "Koothattukulam"
    ],
    panchs: [
      "Chellanam", "Kumbalam", "Kumbalangi", "Mulavukad", "Kadamakkudy", "Cheranallur", "Elamkunnapuzha", "Njarakkal",
      "Nayarambalam", "Edavanakkad", "Kuzhuppilly", "Pallippuram", "Chittattukara", "Vadakkekara", "Chendamangalam",
      "Ezhikkara", "Kottuvally", "Varapuzha", "Alangad", "Karumalloor", "Kadungalloor", "Chengamanad", "Nedumbassery",
      "Parakkadavu", "Kunnukara", "Karukutty", "Mookkannoor", "Thuravoor", "Manjapra", "Kalady", "Kanjoor",
      "Sreemoolanagaram", "Malayattoor Neeleswaram", "Ayyampuzha", "Choornikkara", "Edathala", "Keezhmadu", "Vazhakulam",
      "Kizhakkambalam", "Vadavucode-Puthencruz", "Aikaranad", "Kunnathunad", "Mazhuvannoor", "Thiruvaniyoor",
      "Puthenvelikkara", "Amballoor", "Chottanikkara", "Edakkattuvayal", "Mulanthuruthy", "Udayamperoor", "Maneed",
      "Pampakuda", "Ramamangalam", "Thirumarady", "Marady", "Arakuzha", "Payipra", "Valakom", "Kalloorkkad",
      "Pothanicad", "Ayavana", "Paingottoor", "Asamannoor", "Vengoor", "Mudakuzha", "Rayamangalam", "Okkal",
      "Koovappady", "Keerampara", "Kuttampuzha", "Pindimana", "Varappetty", "Pallarimangalam", "Nellikuzhi",
      "Kottappady", "Kavalangad", "Puthrikka", "Poothrikka", "Elanji", "Palakuzha", "Mulavoor"
    ]
  },
  thrissur: {
    corps: ["Thrissur"],
    munis: ["Chalakudy", "Chavakkad", "Guruvayur", "Irinjalakuda", "Kodungallur", "Kunnamkulam", "Wadakkanchery"],
    panchs: [
      "Kadappuram", "Orumanayoor", "Punnayoor", "Punnayoorkulam", "Vadakkekkad", "Choondal", "Chowannur", "Kadavalloor",
      "Kandanassery", "Kattakampal", "Porkulam", "Kadangode", "Velur", "Desamangalam", "Erumapetty", "Mullurkkara",
      "Thekkumkara", "Varavoor", "Chelakkara", "Vallathole Nagar", "Kondazhy", "Panjal", "Pazhayannur", "Thiruvilwamala",
      "Madakkathara", "Nadathara", "Pananchery", "Puthur", "Adat", "Avanur", "Kaiparambu", "Mulamkunnathukavu",
      "Tholur", "Kolazhy", "Elavally", "Mullassery", "Pavaratty", "Venkitangu", "Engandiyoor", "Vadanappilly",
      "Thalikulam", "Nattika", "Valappad", "Edathiruthy", "Kaipamangalam", "Mathilakam", "Perinjanam", "Sree Narayanapuram",
      "Edavilangu", "Eriyad", "Anthikkad", "Thanniam", "Chazhur", "Manalur", "Arimbur", "Avinissery", "Cherpu",
      "Paralam", "Vallachira", "Alagappanagar", "Kodakara", "Mattattur", "Nenmanikkara", "Pudukkad", "Thrikkur",
      "Varantharappilly", "Karalam", "Kattoor", "Muriyad", "Parappookkara", "Padiyoor", "Poomangalam", "Puthenchira",
      "Vellangalur", "Velookkara", "Aloor", "Annamanada", "Kuzhur", "Mala", "Poyya", "Kadukutty", "Kodassery",
      "Korattiy", "Meloor", "Pariyaram", "Athirappilly"
    ]
  },
  palakkad: {
    corps: [],
    munis: ["Chittur-Thathamangalam", "Ottappalam", "Palakkad", "Shornur", "Cherpulassery", "Mannarkkad", "Pattambi"],
    panchs: [
      "Ambalappara", "Ananganadi", "Chalavara", "Lakkidi-Perur", "Ottappalam (Rural)", "Vaniyamkulam", "Vellinezhi",
      "Shornur (Rural)", "Cherpulassery (Rural)", "Thrikkadeeri", "Kadampazhipuram", "Karimpuzha", "Kulukkallur",
      "Nellaya", "Pookkottukavu", "Sreekrishnapuram", "Vilayur", "Alanallur", "Kottoppadam", "Kumaramputhur",
      "Mannarkkad (Rural)", "Thenkara", "Agali", "Pudur", "Sholayur", "Karakurissi", "Karimba", "Thachanattukara",
      "Koppam", "Muthuthala", "Ongallur", "Parudur", "Pattambi (Rural)", "Thiruvegapura", "Vallapuzha", "Anakkara",
      "Chalissery", "Kappur", "Nagalassery", "Pattithara", "Thrithala", "Parali", "Pirayiri", "Mundur", "Kongad",
      "Keralassery", "Mankara", "Mannur", "Akathethara", "Elappully", "Malampuzha", "Marutharode", "Puduppariyaram",
      "Pudussery", "Kodumbu", "Polpully", "Alathur", "Erimayur", "Kavassery", "Kizhakkancherry", "Puthucode",
      "Tarur", "Vadakkencherry", "Vandazhi", "Kannabra", "Coyalmannam", "Kannadi", "Kuthannur", "Kuzhalmannam",
      "Mathur", "Peringottukurissi", "Thenkurissi", "Ayiloor", "Melarcode", "Nallepilly", "Nenmara", "Pallassana",
      "Elavancherry", "Pallasena", "Koduvayur", "Peruvemba", "Pudunagaram", "Vadavannur", "Eruthempathy",
      "Kozhinjampara", "Muthalamada", "Pattancherry", "Vadakarapathy"
    ]
  },
  malappuram: {
    corps: [],
    munis: [
      "Malappuram", "Manjeri", "Perinthalmanna", "Ponnani", "Tirur", "Kondotty", "Kottakkal", "Nilambur", "Tanur",
      "Tirurangadi", "Valanchery", "Parappanangadi"
    ],
    panchs: [
      "Chungathara", "Edakkara", "Karulai", "Moothedam", "Amarambalam", "Chaliyar", "Karuvarakundu", "Mampad",
      "Thiruvali", "Tuvvur", "Wandoor", "Porur", "Kalikavu", "Chokkad", "Edavanna", "Pandikkad", "Anakkayam",
      "Morayur", "Pookkottur", "Pulpatta", "Kuzhimanna", "Areekode", "Kavanur", "Urangattiri", "Vazhakkad",
      "Vazhayur", "Cheekkode", "Cherukavu", "Pallikkal", "Pulikkal", "Chelambra", "Thenhipalam", "Moonniyur",
      "Peruvallur", "Kannamangalam", "Othukkungal", "Makkaraparamba", "Koottilangadi", "Kodur", "Ponmala",
      "Oorakam", "Vengara", "AR Nagar", "Parappur", "Thennala", "Perumannadekla", "Nannambra", "Kalpakanchery",
      "Valavannur", "Cheriyamundam", "Thalakkad", "Thirunavaya", "Athavanad", "Edayur", "Irimbiliyam", "Marakkara",
      "Kuttippuram", "Kottakkal (Rural)", "Ponmundam", "Tanalur", "Ozhur", "Niramaruthur", "Mangalam", "Purathur",
      "Triprangode", "Vattamkulam", "Edappal", "Kalady", "Thavanur", "Alamcode", "Nannamukku", "Perumpadappa",
      "Veliyankode", "Maranchery", "Aliparamba", "Elamkulam", "Keezhattur", "Melattur", "Thazhekode", "Vetthathur",
      "Angadipuram", "Kuruva", "Puzhakkattiri", "Moorkanad", "Pulamanthole", "Edappatta", "Karathur", "Vettom",
      "Trikaripur", "Perinthalmanna (Rural)", "Mankada", "Kariyavattom"
    ]
  },
  kozhikode: {
    corps: ["Kozhikode"],
    munis: ["Koyilandy", "Vadakara", "Koduvally", "Mukkam", "Ramanattukara", "Feroke", "Payyoli"],
    panchs: [
      "Azhiyur", "Chorode", "Eramala", "Onchiyam", "Chekkiad", "Purameri", "Thuneri", "Valayam", "Vanimel", "Edacheri",
      "Nadapuram", "Kunnummal", "Velom", "Kayakkodi", "Kavilumpara", "Kuttiady", "Maruthonkara", "Naripatta",
      "Ayancheri", "Villiappally", "Maniyur", "Thiruvallur", "Thurayur", "Keezhariyur", "Thikkodi", "Meppayur",
      "Cheruvannur", "Nochad", "Changaroth", "Kayanna", "Koothali", "Perambra", "Chakkittappara", "Balussery",
      "Naduvannur", "Kottur", "Ulliyeri", "Unnikulam", "Panangad", "Koorachundu", "Chemanchery", "Arikkulam",
      "Moodadi", "Chengottukave", "Atholi", "Kakkodi", "Chelannur", "Kakkur", "Nanmanda", "Narikkuni", "Thalakkulathur",
      "Thiruvambady", "Koodaranhi", "Kizhakkoth", "Madavoor", "Puthuppadi", "Thamarassery", "Omasery", "Kattippara",
      "Kodenchery", "Kodiyathur", "Kuruvattur", "Mavoor", "Karasseri", "Kunnamangalam", "Chathamangalam", "Peruvayal",
      "Perumanna", "Kadalundi", "Olavanna"
    ]
  },
  wayanad: {
    corps: [],
    munis: ["Kalpetta", "Mananthavady", "Sulthan Bathery"],
    panchs: [
      "Vellamunda", "Thirunelly", "Thondernadu", "Edavaka", "Thavinhal", "Noolpuzha", "Nenmeni", "Ambalavayal",
      "Meenangadi", "Vengappally", "Vythiri", "Pozhuthana", "Thariode", "Meppadi", "Muppainadu", "Kottathara",
      "Muttil", "Padinjarathara", "Panamaram", "Kaniyambetta", "Poothady", "Pulpally", "Mullankolly"
    ]
  },
  kannur: {
    corps: ["Kannur"],
    munis: ["Mattannur", "Iritty", "Koothuparamba", "Payyannur", "Thalassery", "Taliparamba", "Anthoor", "Sreekandapuram", "Panoor"],
    panchs: [
      "Cheruthazham", "Madayi", "Ezhome", "Cherukunnu", "Mattool", "Kannapuram", "Kalliassery", "Narath", "Cherupuzha",
      "Peringome Vayakkara", "Eramam-Kuttoor", "Kankole-Alapadamba", "Karivellur-Peralam", "Kunhimangalam", "Ramanthali",
      "Udayagiri", "Alakode", "Naduvil", "Chapparapadavu", "Chengalayi", "Kurumathoor", "Pariyaram", "Pattuvam",
      "Kadannappalli-Panappuzha", "Irikkur", "Eruvessy", "Malappattam", "Payyavoor", "Mayyil", "Padiyoor Kalliad",
      "Ulikkal", "Kuttiattoor", "Chirakkal", "Valapattanam", "Azheekode", "Pappinissery", "Kolachery", "Munderi",
      "Chembilode", "Kadambur", "Peralassery", "Muzhappilangad", "Vengad", "Dharmadam", "Eranholi", "Pinarayi",
      "New Mahe", "Ancharakandy", "Thripangottoor", "Chittariparamba", "Pattiam", "Kunnothuparamba", "Mangattidam",
      "Kottayam", "Chockli", "Panniyannur", "Mokeri", "Kadirur", "Aralam", "Ayyankunnu", "Keezhallur", "Thillankeri",
      "Koodali", "Payam", "Kanichar", "Kelakam", "Kottiyoor", "Muzhakkunnu", "Kolayad", "Malur", "Peravoor"
    ]
  },
  kasaragod: {
    corps: [],
    munis: ["Kanhangad", "Kasaragod", "Nileshwaram"],
    panchs: [
      "Manjeshwaram", "Vorkady", "Meenja", "Paivalike", "Enmakaje", "Mangalpady", "Kumbla", "Puthige", "Mogral-Puthur",
      "Madhur", "Bellur", "Karadka", "Muliyar", "Delampady", "Bedadka", "Kuttikole", "Chengala", "Badiadka", "Kumbadaje",
      "Chemmanad", "Udma", "Pullur-Periya", "Pallikkere", "Ajanoor", "Madikai", "Kodom-Belur", "Balal", "Kallar",
      "Panathady", "Kinanoor-Karinthalam", "West Eleri", "East Eleri", "Kayyur-Cheemeni", "Pilicode", "Trikarpur",
      "Padanna", "Valiyaparamba", "Cheruvathur"
    ]
  }
};

export function getLocalBodiesForDistrict(district: string): LocalBody[] {
  const dClean = district.trim();
  const dLower = dClean.toLowerCase();

  // If the selected district has a direct mapping in Kerala
  const keralaData = KERALA_LOCAL_BODIES[dLower];
  if (keralaData) {
    const list: LocalBody[] = [];
    
    // Add Corporations
    keralaData.corps.forEach((name) => {
      list.push({
        id: `corp_${dLower}_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        name: `${name} Corporation`,
        type: "Corporation"
      });
    });

    // Add Municipalities
    keralaData.munis.forEach((name) => {
      list.push({
        id: `muni_${dLower}_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        name: `${name} Municipality`,
        type: "Municipality"
      });
    });

    // Add Panchayats
    keralaData.panchs.forEach((name) => {
      list.push({
        id: `panch_${dLower}_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        name: `${name} Panchayat`,
        type: "Panchayat"
      });
    });

    return list;
  }

  // Fallback dynamic generation for other states/districts outside Kerala
  return [
    { id: `${dLower}_corp`, name: `${dClean} Municipal Corporation`, type: "Corporation" },
    { id: `${dLower}_muni`, name: `${dClean} Municipality`, type: "Municipality" },
    { id: `${dLower}_panchayat`, name: `${dClean} Panchayat`, type: "Panchayat" }
  ];
}

export function getDistrictForLocalBody(cityName: string): string {
  if (!cityName) return "Ernakulam";
  const nameClean = cityName.replace(/(Corporation|Municipality|Panchayat)/i, "").trim().toLowerCase();
  
  for (const [district, data] of Object.entries(KERALA_LOCAL_BODIES)) {
    const allNames = [
      ...data.corps.map(n => n.toLowerCase()),
      ...data.munis.map(n => n.toLowerCase()),
      ...data.panchs.map(n => n.toLowerCase())
    ];
    if (allNames.includes(nameClean) || allNames.some(n => n.includes(nameClean) || nameClean.includes(n))) {
      return district.charAt(0).toUpperCase() + district.slice(1);
    }
  }
  return "Ernakulam"; // Default fallback
}

