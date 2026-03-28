"""
Management command to:
  1. Remove duplicate treks (keeping the lowest ID for each duplicate name)
  2. Populate description, location, coordinates_lat, coordinates_lng for all treks
"""

from django.core.management.base import BaseCommand
from api.models import Trek

TREK_DATA = {
    "Ghorepani Poon Hill Trek": {
        "location": "Annapurna Region",
        "coordinates_lat": 28.3999,
        "coordinates_lng": 83.6960,
        "description": (
            "One of Nepal's most popular short treks, offering stunning panoramic views of the "
            "Annapurna and Dhaulagiri ranges from Poon Hill at 3,210m. The trail winds through "
            "dense rhododendron forests and traditional Gurung and Magar villages. Best experienced "
            "during spring when the rhododendrons are in full bloom."
        ),
    },
    "Khopra Ridge Khayar Lake Trek": {
        "location": "Annapurna Region",
        "coordinates_lat": 28.4333,
        "coordinates_lng": 83.5667,
        "description": (
            "An off-the-beaten-path extension of the Poon Hill route, reaching the sacred Khayar "
            "Lake at 4,500m and the spectacular Khopra Danda ridge. The trail offers exceptional "
            "views of Dhaulagiri, Nilgiri, and Annapurna South with far fewer crowds than "
            "mainstream routes. A rewarding trek blending natural beauty and cultural immersion."
        ),
    },
    "Indigenous Peoples Trail Trek": {
        "location": "Annapurna Region",
        "coordinates_lat": 28.3500,
        "coordinates_lng": 83.8000,
        "description": (
            "A culturally rich trek winding through villages of diverse indigenous communities "
            "including the Gurung, Magar, and Thakali peoples of the Annapurna foothills. The "
            "trail offers a genuine off-the-beaten-path experience with authentic homestay "
            "accommodations and traditional hospitality. A fascinating window into Nepal's ethnic "
            "diversity and rural way of life."
        ),
    },
    "Dhaulagiri Circuit Trek": {
        "location": "Dhaulagiri Region",
        "coordinates_lat": 28.6981,
        "coordinates_lng": 83.4861,
        "description": (
            "One of Nepal's most challenging and remote treks, circumnavigating the 8,167m "
            "Dhaulagiri massif through high-altitude passes and glaciers. The route crosses the "
            "French Pass (5,360m) and Dhampus Pass (5,182m), offering some of the most dramatic "
            "mountain scenery in the Himalayas. Suitable only for highly experienced trekkers "
            "with proper acclimatization."
        ),
    },
    "Everest High Passes Trek": {
        "location": "Everest Region",
        "coordinates_lat": 27.9354,
        "coordinates_lng": 86.7184,
        "description": (
            "A challenging high-altitude adventure crossing three iconic Himalayan passes: Kongma "
            "La (5,535m), Cho La (5,420m), and Renjo La (5,340m). The route encompasses all the "
            "highlights of Everest Base Camp while adding Gokyo Lakes and breathtaking ridge-top "
            "views of Everest, Lhotse, and Cho Oyu. An unforgettable experience for fit and "
            "experienced trekkers."
        ),
    },
    "Numbur Cheese Circuit Trek": {
        "location": "Everest Region",
        "coordinates_lat": 27.6000,
        "coordinates_lng": 86.6000,
        "description": (
            "A hidden gem in the Solu region below the Khumbu, combining spectacular mountain "
            "scenery with a unique focus on the area's traditional cheese-making heritage. The "
            "trek visits remote highland settlements and yak pastures where centuries-old dairy "
            "traditions are still practiced. A wonderful alternative for those seeking the Everest "
            "region experience away from crowded main trails."
        ),
    },
    "Guerrilla Trek": {
        "location": "Mid-Western Nepal",
        "coordinates_lat": 28.5000,
        "coordinates_lng": 82.8000,
        "description": (
            "A historically significant trek through the heartland of Nepal's Maoist insurgency, "
            "now offering a fascinating blend of cultural immersion and remote mountain scenery. "
            "The trail passes through villages in Myagdi and Rukum districts that played a central "
            "role in Nepal's decade-long civil conflict, with former fighters now welcoming "
            "trekkers as guides. A deeply authentic experience far from well-trodden tourist circuits."
        ),
    },
    "Kathmandu Valley Trek": {
        "location": "Kathmandu Valley",
        "coordinates_lat": 27.7172,
        "coordinates_lng": 85.3240,
        "description": (
            "A surprisingly rewarding trek through the cultural heartland of Nepal, connecting "
            "ancient temple towns, hilltop viewpoints, and traditional Newari villages surrounding "
            "the Kathmandu Valley. The route links major pilgrimage sites and medieval cities "
            "including Patan, Bhaktapur, and Kirtipur while offering sweeping Himalayan panoramas. "
            "Perfect for those with limited time who still want to experience Nepal's trekking culture."
        ),
    },
    "Chepang Hill Trek": {
        "location": "Chitwan / Dhading",
        "coordinates_lat": 27.7000,
        "coordinates_lng": 84.8000,
        "description": (
            "An immersive community trekking experience through the traditional villages of the "
            "Chepang people, one of Nepal's most marginalized indigenous groups living in the "
            "hills of Dhading and Chitwan districts. The trail winds through subtropical forests "
            "and terraced farmland with intimate homestay accommodation in Chepang communities. "
            "Proceeds from this trek directly support local community development and conservation."
        ),
    },
    "Annapurna Circuit Trek": {
        "location": "Annapurna Region",
        "coordinates_lat": 28.5893,
        "coordinates_lng": 84.1258,
        "description": (
            "The legendary Annapurna Circuit is widely considered one of the world's greatest "
            "treks, circumnavigating the entire Annapurna Massif and crossing the Thorong La Pass "
            "at 5,416m. The route passes through an extraordinary range of landscapes from "
            "subtropical lowlands to high-altitude desert, with a corresponding diversity of "
            "ethnic communities. A classic bucket-list trek offering unparalleled cultural and "
            "natural variety across its 200+ kilometer route."
        ),
    },
    "Upper Dolpo Trek": {
        "location": "Dolpo Region",
        "coordinates_lat": 28.9694,
        "coordinates_lng": 82.8542,
        "description": (
            "A journey to one of the world's most remote and least-visited regions, Upper Dolpo "
            "lies beyond the Himalayas in the trans-Himalayan rain shadow zone bordering Tibet. "
            "The landscape features ancient Bon monasteries, turquoise lakes, and barren high "
            "plateaus that feel like stepping into another era. This restricted-area trek requires "
            "a special permit and offers an experience of Tibetan culture essentially unchanged "
            "for centuries."
        ),
    },
    "Mohare Danda Trek": {
        "location": "Annapurna Region",
        "coordinates_lat": 28.4000,
        "coordinates_lng": 83.7500,
        "description": (
            "A community-managed trekking trail offering some of the finest Himalayan panoramas "
            "in the Annapurna region from the spectacular Mohare Danda ridge at 3,300m. The route "
            "traverses rhododendron forests and traditional Gurung villages, with all proceeds "
            "supporting local conservation and community welfare. A wonderful alternative to the "
            "Poon Hill trail with equally stunning views but far fewer crowds."
        ),
    },
    "Pikey Peak and Dudh Kunda Trek": {
        "location": "Everest Region",
        "coordinates_lat": 27.4000,
        "coordinates_lng": 86.6000,
        "description": (
            "Combining two of Solu Khumbu's most rewarding destinations, this trek reaches the "
            "panoramic summit of Pikey Peak (4,065m) before continuing to the sacred glacial lake "
            "of Dudh Kunda at 4,560m. The views from Pikey Peak encompass Everest, Makalu, "
            "Kanchenjunga, Langtang, and the Annapurnas in a single sweep. A spiritually "
            "significant and scenically spectacular journey through the culturally rich Sherpa homeland."
        ),
    },
    "Everest Base Camp Trek": {
        "location": "Everest Region",
        "coordinates_lat": 27.9881,
        "coordinates_lng": 86.9250,
        "description": (
            "The world's most iconic trekking route, leading through the legendary Khumbu Valley "
            "to the base camp of the world's highest mountain at 5,364m. The trail passes through "
            "Sherpa villages, ancient monasteries, and the bustling hub of Namche Bazaar before "
            "delivering breathtaking close-up views of Everest, Lhotse, and Nuptse. An "
            "unforgettable pilgrimage through the heart of Sherpa culture and Himalayan history."
        ),
    },
    "Upper Mustang Trek": {
        "location": "Mustang Region",
        "coordinates_lat": 29.1833,
        "coordinates_lng": 83.9500,
        "description": (
            "A journey to the fabled 'Last Forbidden Kingdom' — the ancient walled city of Lo "
            "Manthang in the remote Upper Mustang, closed to outsiders until 1992. The landscape "
            "is a dramatic high-altitude desert of eroded canyons, ancient cave dwellings, and "
            "medieval monasteries preserving a Tibetan culture unchanged for 500 years. This "
            "restricted-area trek offers one of the most unique cultural experiences in the Himalayas."
        ),
    },
    "Ganesh Himal Trek": {
        "location": "Ganesh Himal Region",
        "coordinates_lat": 28.3833,
        "coordinates_lng": 85.0000,
        "description": (
            "A rarely trekked journey into the wild and pristine Ganesh Himal range north of "
            "Kathmandu, offering superb mountain views and authentic cultural encounters away "
            "from the tourist mainstream. The trail winds through traditional Tamang villages "
            "and dense forests, with the dramatic Ganesh Himal peaks providing a constant "
            "backdrop. An excellent choice for trekkers seeking solitude and genuine "
            "off-the-beaten-path adventure."
        ),
    },
    "Manaslu Circuit Trek": {
        "location": "Manaslu Region",
        "coordinates_lat": 28.5500,
        "coordinates_lng": 84.5600,
        "description": (
            "A spectacular circuit of the world's eighth-highest mountain (8,163m), now recognised "
            "as one of Nepal's finest long-distance trekking routes. The highlight is crossing the "
            "Larkya La Pass at 5,160m, with panoramic views of Manaslu, Himalchuli, and the "
            "Annapurna range. Requiring a restricted area permit, the route rewards trekkers with "
            "pristine landscapes and authentic Tibetan-influenced cultural encounters."
        ),
    },
    "Ruby Valley Trek": {
        "location": "Ganesh Himal Region",
        "coordinates_lat": 28.2333,
        "coordinates_lng": 85.1500,
        "description": (
            "Named for the rubies and semi-precious stones found in its riverbeds, the Ruby Valley "
            "Trek traverses the rugged foothills north of Kathmandu through Tamang and Gurung "
            "communities. The route offers sweeping views of the Ganesh Himal and Langtang ranges "
            "while passing through terraced farmland and ancient village monasteries. A wonderfully "
            "authentic experience combining natural beauty, cultural depth, and geological fascination."
        ),
    },
    "Rolwaling Tashi Laptsa Pass Trek": {
        "location": "Rolwaling Region",
        "coordinates_lat": 27.9000,
        "coordinates_lng": 86.1000,
        "description": (
            "One of Nepal's most technically demanding high-altitude crossings, the Tashi Laptsa "
            "Pass (5,755m) links the remote Rolwaling Valley with the Khumbu in a challenging "
            "trans-Himalayan traverse. The Rolwaling Valley itself is a sacred and little-visited "
            "wilderness of glaciers, high alpine lakes, and the extraordinary Tsho Rolpa glacial "
            "lake. Only experienced mountaineers with technical skills and proper equipment should "
            "attempt this extraordinary journey."
        ),
    },
    "Dhampus Sarangkot Trek": {
        "location": "Annapurna Region",
        "coordinates_lat": 28.2633,
        "coordinates_lng": 83.9500,
        "description": (
            "A short and accessible trek combining two of the most popular viewpoints above "
            "Pokhara — the Gurung village of Dhampus and the hilltop of Sarangkot — for superb "
            "sunrise views of the Annapurna and Machhapuchhre ranges. The gentle trail through "
            "terraced fields and forest is ideal for beginners or those with limited time. A "
            "perfect introduction to the magic of the Annapurna foothills."
        ),
    },
    "Tamang Heritage Trail Trek": {
        "location": "Langtang Region",
        "coordinates_lat": 28.2000,
        "coordinates_lng": 85.4000,
        "description": (
            "A culturally immersive journey through the heartland of the Tamang people, one of "
            "Nepal's largest and most distinct indigenous communities living in the hills north of "
            "Kathmandu. The trail visits ancient gompas, traditional villages, and sacred "
            "landscapes that form the spiritual core of Tamang identity. Rebuilt after the "
            "devastating 2015 earthquake, the communities along this route welcome trekkers as "
            "a key source of livelihood and cultural exchange."
        ),
    },
    "Langtang Valley Trek": {
        "location": "Langtang Region",
        "coordinates_lat": 28.2133,
        "coordinates_lng": 85.5167,
        "description": (
            "The Langtang Valley offers some of the most accessible and spectacular Himalayan "
            "scenery in Nepal, with the dramatic Langtang Lirung (7,234m) rising directly above "
            "the valley floor. The route passes through beautiful forests of rhododendron and oak, "
            "traditional Tamang villages, and the famous yak cheese factories of Kyanjin Gompa. "
            "Rebuilding strongly since the catastrophic 2015 earthquake, Langtang today offers a "
            "deeply moving and beautiful trekking experience."
        ),
    },
    "Jomsom Muktinath Trek": {
        "location": "Mustang Region",
        "coordinates_lat": 28.7808,
        "coordinates_lng": 83.7270,
        "description": (
            "A relatively short but culturally rich trek through the high-altitude Mustang "
            "district to the sacred Hindu and Buddhist pilgrimage site of Muktinath at 3,800m. "
            "The trail follows the dramatic Kali Gandaki gorge — the world's deepest river "
            "gorge — past ancient Thakali villages and dramatic wind-eroded landscapes. An "
            "excellent introduction to the unique culture and terrain of the high Mustang region."
        ),
    },
    "Ghalegaun Trek": {
        "location": "Annapurna Region",
        "coordinates_lat": 28.2500,
        "coordinates_lng": 84.5000,
        "description": (
            "A community-based trekking trail through the beautiful Gurung village of Ghalegaun, "
            "known as one of Nepal's most picturesque traditional settlements perched on a "
            "hillside with sweeping mountain views. The trail combines cultural immersion in "
            "authentic village life with rewarding panoramas of the Manaslu, Annapurna, and "
            "Lamjung Himal ranges. An ideal shorter trek for those seeking genuine community "
            "tourism with meaningful cultural exchange."
        ),
    },
    "Nar Phu Valley Trek": {
        "location": "Annapurna Region",
        "coordinates_lat": 28.6500,
        "coordinates_lng": 84.0833,
        "description": (
            "A remote and restricted-area journey into the hidden valleys of Nar and Phu, two "
            "extraordinarily isolated Tibetan communities perched above 4,000m on the northern "
            "fringes of the Annapurna Conservation Area. The stark trans-Himalayan landscape of "
            "eroded cliffs, ancient monasteries, and high-altitude grazing lands is utterly unlike "
            "anything found on Nepal's main trekking circuits. Requiring a special permit, this "
            "trek offers an experience of true Himalayan remoteness."
        ),
    },
    "Lower Dolpo Trek": {
        "location": "Dolpo Region",
        "coordinates_lat": 28.9000,
        "coordinates_lng": 82.8500,
        "description": (
            "An introduction to the mystical Dolpo region passing through ancient Bon-Buddhist "
            "monasteries and traditional trans-Himalayan trading villages. The trail crosses high "
            "passes and dramatic canyon landscapes to reach the crystal-clear Phoksundo Lake, one "
            "of Nepal's most celebrated natural wonders. A challenging but immensely rewarding "
            "adventure through Nepal's most isolated and culturally preserved landscapes."
        ),
    },
    "Helambu Trek": {
        "location": "Langtang Region",
        "coordinates_lat": 27.9333,
        "coordinates_lng": 85.5000,
        "description": (
            "One of Nepal's closest and most accessible trekking destinations from Kathmandu, the "
            "Helambu circuit traverses Buddhist Sherpa and Hyolmo villages in the hills north of "
            "the capital. The gentle terrain and cultural richness make Helambu ideal for "
            "beginners and those with limited time, offering genuinely beautiful ridge-top scenery "
            "and traditional village life. A perfect first trek for those new to Nepal's mountain trails."
        ),
    },
    "Kanchenjunga Trek": {
        "location": "Kanchenjunga Region",
        "coordinates_lat": 27.7041,
        "coordinates_lng": 87.9941,
        "description": (
            "An epic journey to the base camps of Kanchenjunga (8,586m), the world's third-highest "
            "mountain, in Nepal's remote far-eastern Himalaya near the borders with India and Tibet. "
            "The long approach through diverse subtropical forests and terraced farmlands of the "
            "Taplejung district makes this one of the most biodiverse trekking routes in Nepal. "
            "Requiring a restricted area permit, this is a true wilderness adventure through one "
            "of the Himalayas' most isolated and spectacular regions."
        ),
    },
    "Gokyo Lake Trek": {
        "location": "Everest Region",
        "coordinates_lat": 27.9611,
        "coordinates_lng": 86.6806,
        "description": (
            "A spectacular alternative to the classic EBC route, the Gokyo trek leads through "
            "the Khumbu Valley to the stunning turquoise glacial lakes of the Gokyo valley and "
            "the panoramic summit of Gokyo Ri (5,357m). The views from Gokyo Ri of Everest, "
            "Lhotse, Makalu, and Cho Oyu are considered among the finest in the entire Himalayas. "
            "Fewer crowds than the main EBC route make Gokyo an increasingly popular and deeply "
            "rewarding choice."
        ),
    },
    "Pikey Peak Trek": {
        "location": "Everest Region",
        "coordinates_lat": 27.4000,
        "coordinates_lng": 86.5500,
        "description": (
            "A gem of a short trek to the summit of Pikey Peak (4,065m) in the culturally rich "
            "Sherpa homeland of Solu, offering a remarkable 360-degree panorama encompassing "
            "Everest and most of Nepal's highest peaks. Sir Edmund Hillary reportedly described "
            "Pikey Peak as one of the finest viewpoints in the entire Himalayan range. The route "
            "passes through beautiful rhododendron forests and traditional Sherpa villages rarely "
            "visited by mainstream trekkers."
        ),
    },
    "Everest Panorama Trek": {
        "location": "Everest Region",
        "coordinates_lat": 27.8067,
        "coordinates_lng": 86.7142,
        "description": (
            "A shorter and more accessible version of the classic EBC trek, reaching the dramatic "
            "viewpoint of Tengboche Monastery (3,867m) for stunning vistas of Everest, Lhotse, "
            "Ama Dablam, and the surrounding Khumbu peaks. The trail still passes through Namche "
            "Bazaar and the cultural heartland of the Sherpa people, providing all the atmosphere "
            "of the Everest region without the extended commitment of the full EBC route. Ideal "
            "for those with limited time or acclimatization concerns."
        ),
    },
    "Annapurna Panorama Trek": {
        "location": "Annapurna Region",
        "coordinates_lat": 28.3999,
        "coordinates_lng": 83.6960,
        "description": (
            "A short and scenic introduction to the Annapurna region, combining the spectacular "
            "views from Poon Hill (3,210m) with a traverse through traditional Gurung villages "
            "and rhododendron forests. This accessible route offers some of the finest mountain "
            "panoramas in Nepal within a manageable 5–7 day itinerary. The perfect first "
            "Himalayan trekking experience for those new to high-altitude walking."
        ),
    },
    "Langtang Valley Ganja La Pass Trek": {
        "location": "Langtang Region",
        "coordinates_lat": 28.2133,
        "coordinates_lng": 85.5167,
        "description": (
            "A challenging extension of the classic Langtang Valley Trek that crosses the "
            "technical Ganja La Pass at 5,122m to connect the Langtang Valley with the Helambu "
            "region in a spectacular trans-Himalayan traverse. The high-altitude crossing demands "
            "excellent fitness and is only recommended for experienced trekkers with a local guide. "
            "The reward is unparalleled 360-degree panoramas of the Langtang and Jugal Himalayan "
            "ranges from one of Nepal's most dramatic mountain passes."
        ),
    },
    "Rupina La Pass Trek": {
        "location": "Manaslu Region",
        "coordinates_lat": 28.1500,
        "coordinates_lng": 84.9500,
        "description": (
            "A hidden gem in the Gorkha hills connecting the Budhi Gandaki valley to the Tsum "
            "Valley via the high Rupina La Pass at 4,650m, offering spectacular views of the "
            "Manaslu and Boudha Himal ranges. The trail passes through pristine rhododendron "
            "forests and remote Gurung villages rarely visited by foreign trekkers. An excellent "
            "acclimatization and approach route for those heading to the Manaslu Circuit or "
            "Tsum Valley treks."
        ),
    },
    "Khaptad Trek": {
        "location": "Far-Western Nepal",
        "coordinates_lat": 29.4000,
        "coordinates_lng": 81.2000,
        "description": (
            "A peaceful and spiritually significant trek through the Khaptad National Park in "
            "Nepal's far-western region, visiting the ashram of the revered Hindu saint Khaptad "
            "Baba and trekking across vast highland meadows dotted with sacred ponds and shrines. "
            "The park protects a unique ecosystem of grasslands and forests home to diverse "
            "wildlife including leopards and black bears. A wonderfully off-the-beaten-path "
            "destination combining natural beauty, wildlife, and spiritual significance."
        ),
    },
    "Rara Lake Trek": {
        "location": "Karnali Region",
        "coordinates_lat": 29.5333,
        "coordinates_lng": 82.0833,
        "description": (
            "A remote journey to Rara Lake, Nepal's largest lake and one of its most pristine "
            "natural treasures, nestled at 2,990m in the Mugu district of the remote Karnali "
            "province. The crystal-clear azure waters surrounded by forested ridges and "
            "snow-capped peaks create a landscape of extraordinary and serene beauty rarely "
            "visited by tourists. Requiring a flight to Jumla and a multi-day approach, Rara "
            "Lake rewards the effort with an unmatched sense of wilderness solitude."
        ),
    },
    "Annapurna Base Camp Trek": {
        "location": "Annapurna Region",
        "coordinates_lat": 28.5303,
        "coordinates_lng": 83.8781,
        "description": (
            "One of Nepal's most beloved treks, leading through the dramatic Modi Khola gorge to "
            "the spectacular natural amphitheater of the Annapurna Sanctuary at 4,130m, encircled "
            "by a ring of towering peaks. The route passes through Gurung villages, bamboo and "
            "rhododendron forests, and high-altitude moraines before arriving at one of the most "
            "dramatic mountain settings anywhere in the world. A magical journey offering "
            "close-up views of Annapurna I (8,091m), Machapuchare, and numerous Himalayan giants."
        ),
    },
    "Royal Trek": {
        "location": "Annapurna Region",
        "coordinates_lat": 28.3000,
        "coordinates_lng": 84.1000,
        "description": (
            "A short and gentle walk through the lower Annapurna foothills following a route "
            "taken by Prince Charles during his visit to Nepal in 1980, hence the name. The trail "
            "passes through traditional Gurung and Brahmin villages with sweeping views of the "
            "Annapurna and Lamjung Himal ranges. An ideal trek for families and those seeking a "
            "relaxed, culturally focused experience without the rigors of high-altitude trekking."
        ),
    },
    "Mardi Himal Trek": {
        "location": "Annapurna Region",
        "coordinates_lat": 28.4511,
        "coordinates_lng": 83.9378,
        "description": (
            "A newly developed trekking trail leading to the base of Mardi Himal (5,587m) through "
            "dense forests and high ridges of the Annapurna Conservation Area, offering some of "
            "the most intimate close-up views of Machapuchare (Fishtail) available from any "
            "trekking route. The trail ascends through rhododendron and bamboo forests to the "
            "Mardi Himal High Camp (4,500m) with spectacular views across the Annapurna Sanctuary. "
            "A fantastic alternative to the ABC trek that feels genuinely wild and uncrowded."
        ),
    },
    "Langtang Circuit Trek": {
        "location": "Langtang Region",
        "coordinates_lat": 28.2133,
        "coordinates_lng": 85.5167,
        "description": (
            "A comprehensive circuit combining the Langtang Valley with the Helambu region, "
            "crossing the challenging Ganja La Pass (5,122m) for a complete experience of "
            "Langtang National Park's extraordinary landscapes and cultures. The route encompasses "
            "Tamang and Sherpa villages, ancient monasteries, beautiful forests, and dramatic "
            "high-altitude terrain in a single extended itinerary. One of the most rewarding "
            "longer treks in the Langtang region for those seeking to experience its full diversity."
        ),
    },
    "Tsum Valley Trek": {
        "location": "Manaslu Region",
        "coordinates_lat": 28.7500,
        "coordinates_lng": 84.8667,
        "description": (
            "A journey to the hidden 'Beyul' (sacred valley) of Tsum, a remote Tibetan-influenced "
            "community that remained largely isolated from the outside world until recently. The "
            "valley's ancient culture, sacred monasteries, and warm-hearted Tsumpa people are "
            "remarkably preserved, offering a glimpse of traditional Himalayan Buddhist life "
            "essentially unchanged for centuries. A profoundly moving cultural and spiritual "
            "experience in one of Nepal's most remote and mystical corners."
        ),
    },
    "Makalu Base Camp Trek": {
        "location": "Makalu Region",
        "coordinates_lat": 27.8897,
        "coordinates_lng": 87.0883,
        "description": (
            "An adventurous expedition-style trek to the base camp of Makalu (8,485m), the "
            "world's fifth-highest mountain, through the spectacular and biodiverse Makalu Barun "
            "National Park. The route passes through some of Nepal's most pristine wilderness, "
            "including dense forests of rhododendron and magnolia, high alpine meadows, and "
            "dramatic glacial terrain surrounding Makalu's base camp at 5,700m. One of Nepal's "
            "most challenging and remote treks, offering extraordinary rewards for experienced "
            "wilderness trekkers."
        ),
    },
    "Annapurna Circuit with Mesokanto Pass Trek": {
        "location": "Annapurna Region",
        "coordinates_lat": 28.5893,
        "coordinates_lng": 84.1258,
        "description": (
            "An extended variation of the classic Annapurna Circuit that includes the rarely "
            "crossed Mesokanto Pass (5,100m) linking Jomsom to the spectacular Tilicho Lake "
            "(4,919m), one of the world's highest lakes. The addition of this high-altitude pass "
            "crossing adds dramatic scenery and solitude to the already outstanding circuit route. "
            "For experienced trekkers seeking to enhance the classic circuit with additional "
            "adventure and spectacular scenery."
        ),
    },
    "Everest Advanced Base Camp Trek": {
        "location": "Everest Region",
        "coordinates_lat": 28.0025,
        "coordinates_lng": 86.8528,
        "description": (
            "A challenging extension beyond the classic Everest Base Camp, ascending further onto "
            "the Khumbu Glacier to reach Crampon Point at approximately 5,600m — the start of the "
            "technical climbing route to Everest's summit. The extraordinary close-up views of the "
            "Khumbu Icefall and Western Cwm offer trekkers a tantalizing glimpse into the world of "
            "Himalayan mountaineering. Only recommended for well-acclimatized and physically "
            "excellent trekkers with prior high-altitude experience."
        ),
    },
    "Jiri to Everest Base Camp Trek": {
        "location": "Everest Region",
        "coordinates_lat": 27.6331,
        "coordinates_lng": 86.2333,
        "description": (
            "The original approach route to Everest Base Camp pioneered by Hillary and Tenzing "
            "before the Lukla airstrip was built, starting from the roadhead at Jiri and following "
            "a demanding series of ridges and valleys before joining the main Khumbu trail. The "
            "extended approach adds two additional weeks to the standard EBC trek and is considered "
            "far more challenging but also more culturally and scenically rewarding. A true "
            "Himalayan expedition for those who want to experience the complete journey as it "
            "was originally made."
        ),
    },
    "Arun Valley Trek": {
        "location": "Eastern Nepal",
        "coordinates_lat": 27.5167,
        "coordinates_lng": 87.1833,
        "description": (
            "A remote and little-trekked journey through the spectacular Arun River valley in "
            "eastern Nepal, one of the world's deepest river valleys and a corridor of "
            "extraordinary biodiversity passing from subtropical forests to high Himalayan terrain. "
            "The trail offers immersive encounters with the Rai, Limbu, and Sherpa communities "
            "who inhabit the valley, along with spectacular views of Makalu and the eastern "
            "Himalayan chain. An ideal destination for trekkers seeking wilderness, solitude, "
            "and rich cultural diversity."
        ),
    },
    "Upper Mustang Saribung Peak Climbing": {
        "location": "Mustang Region",
        "coordinates_lat": 29.0833,
        "coordinates_lng": 83.9167,
        "description": (
            "A unique combination of cultural trekking and peak climbing that traverses the ancient "
            "kingdom of Upper Mustang before ascending the technically accessible Saribung Peak "
            "(6,328m). The climbing portion requires basic mountaineering skills and equipment "
            "but does not demand the technical expertise of more serious Himalayan peaks. An "
            "exceptional way to experience the medieval culture of Lo Manthang while adding a "
            "genuine summit achievement to the journey."
        ),
    },
    "Bhairav Kunda Trek": {
        "location": "Langtang Region",
        "coordinates_lat": 27.9333,
        "coordinates_lng": 85.7833,
        "description": (
            "A pilgrimage trek to the sacred glacial lake of Bhairav Kunda, a revered Hindu "
            "shrine set at 4,360m in the remote hills of Sindhupalchok district north of "
            "Kathmandu. The route passes through beautiful forests and traditional Sherpa and "
            "Tamang villages, converging on the sacred lake which draws thousands of Hindu "
            "pilgrims during the annual Janai Purnima festival. A fascinating combination of "
            "natural beauty and living religious tradition rarely experienced by foreign trekkers."
        ),
    },
    "Everest Base Camp with Gokyo Valley Trek": {
        "location": "Everest Region",
        "coordinates_lat": 27.9611,
        "coordinates_lng": 86.6806,
        "description": (
            "The ultimate Everest region experience, combining the classic EBC route with the "
            "spectacular Gokyo Lakes and crossing the challenging Cho La Pass (5,420m) between "
            "the two valleys. The extended route encompasses all the iconic highlights of the "
            "Khumbu — Namche Bazaar, Tengboche Monastery, Gokyo Ri, Everest Base Camp, and "
            "Kala Patthar — in a single comprehensive itinerary. The most complete and rewarding "
            "Everest experience available to trekkers."
        ),
    },
    "Panch Pokhari Trek": {
        "location": "Langtang Region",
        "coordinates_lat": 27.9500,
        "coordinates_lng": 85.6000,
        "description": (
            "A pilgrimage and adventure trek to the Panch Pokhari (Five Sacred Lakes) at 4,200m "
            "in the remote Jalbire area of Sindhupalchok, a series of glacial lakes sacred to "
            "both Hindus and Buddhists. The relatively undeveloped trail passes through "
            "traditional Sherpa and Tamang communities and dense forests before emerging onto "
            "the high ridge where the sacred lakes are found. A beautiful and spiritually "
            "significant journey well off Nepal's main trekking routes."
        ),
    },
    "Manaslu and Tsum Valley Trek": {
        "location": "Manaslu Region",
        "coordinates_lat": 28.5500,
        "coordinates_lng": 84.5600,
        "description": (
            "The ultimate Manaslu region experience, combining the spectacular Manaslu Circuit "
            "with the sacred hidden valley of Tsum in a single extended itinerary. The circuit "
            "crosses the Larkya La Pass (5,160m) before descending into the remote Tsum Valley "
            "with its ancient monasteries, Tibetan culture, and sacred landscapes. A comprehensive "
            "journey through some of Nepal's most dramatic and culturally rich terrain, requiring "
            "a restricted area permit."
        ),
    },
}

# Duplicate names to clean up — keep lowest ID, delete the rest
DUPLICATE_NAMES = [
    "Langtang Valley Trek",
    "Tamang Heritage Trail Trek",
]


class Command(BaseCommand):
    help = "Remove duplicate treks and seed description, location, and coordinates for all treks"

    def handle(self, *args, **kwargs):
        self._remove_duplicates()
        self._seed_data()

    def _remove_duplicates(self):
        self.stdout.write("Removing duplicate treks...")
        removed = 0
        for name in DUPLICATE_NAMES:
            treks = Trek.objects.filter(trek_name=name).order_by("id")
            if treks.count() > 1:
                to_delete = treks[1:]
                ids = list(to_delete.values_list("id", flat=True))
                treks.filter(id__in=ids).delete()
                self.stdout.write(f"  Deleted duplicate(s) of '{name}' (IDs: {ids})")
                removed += len(ids)
        self.stdout.write(self.style.SUCCESS(f"  {removed} duplicate(s) removed.\n"))

    def _seed_data(self):
        self.stdout.write("Seeding trek data...")
        updated = 0
        skipped = 0

        for trek_name, data in TREK_DATA.items():
            try:
                trek = Trek.objects.get(trek_name=trek_name)
                trek.location = data["location"]
                trek.coordinates_lat = data["coordinates_lat"]
                trek.coordinates_lng = data["coordinates_lng"]
                trek.description = data["description"]
                trek.save()
                self.stdout.write(f"  Updated: {trek_name}")
                updated += 1
            except Trek.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"  Not found (skipped): {trek_name}"))
                skipped += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {updated} trek(s) updated, {skipped} skipped (not found in DB)."
            )
        )
