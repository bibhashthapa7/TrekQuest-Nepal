"""
Management command to populate route_geojson for all treks.
Coordinates are key waypoints [lng, lat] tracing each route.
"""
from django.core.management.base import BaseCommand
from api.models import Trek


def make_line(coords):
    """Wrap a coordinate list into a GeoJSON LineString Feature."""
    return {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "LineString",
            "coordinates": coords,   # each item: [lng, lat]
        },
    }


ROUTES = {
    "Ghorepani Poon Hill Trek": make_line([
        [83.7742, 28.3616],  # Nayapul
        [83.7384, 28.3783],  # Tikhedhunga
        [83.7217, 28.3983],  # Ulleri
        [83.7100, 28.4050],  # Banthanti
        [83.6960, 28.3999],  # Ghorepani
        [83.6904, 28.4003],  # Poon Hill
        [83.7050, 28.4100],  # Deurali
        [83.7217, 28.4167],  # Tadapani
        [83.7500, 28.4000],  # Banthanti
        [83.7717, 28.3833],  # Ghandruk
        [83.7742, 28.3616],  # Nayapul
    ]),

    "Khopra Ridge Khayar Lake Trek": make_line([
        [83.7742, 28.3616],  # Nayapul
        [83.6960, 28.3999],  # Ghorepani
        [83.6500, 28.4167],  # Dobato
        [83.5833, 28.4167],  # Khopra Ridge
        [83.5667, 28.4333],  # Khopra Danda
        [83.5333, 28.4500],  # Khayar Lake
    ]),

    "Indigenous Peoples Trail Trek": make_line([
        [83.9856, 28.2096],  # Pokhara
        [83.9300, 28.2333],  # Naudanda
        [83.8833, 28.2500],  # Kaskikot
        [83.8717, 28.2633],  # Dhampus
        [83.8500, 28.2833],  # Pothana
        [83.8167, 28.3167],  # Landruk
        [83.8000, 28.3500],  # Tolka
        [83.7833, 28.3667],  # Ghandruk junction
        [83.7742, 28.3616],  # Nayapul
    ]),

    "Dhaulagiri Circuit Trek": make_line([
        [83.5733, 28.3433],  # Beni
        [83.5167, 28.4333],  # Babiyachaur
        [83.4800, 28.4667],  # Darbang
        [83.4500, 28.5333],  # Muri
        [83.4500, 28.5833],  # Boguwa
        [83.4667, 28.6333],  # Italian Base Camp
        [83.4861, 28.6981],  # Dhaulagiri Base Camp
        [83.4333, 28.7167],  # French Pass (5360m)
        [83.4167, 28.7500],  # Hidden Valley
        [83.4333, 28.7833],  # Dhampus Pass (5182m)
        [83.5500, 28.7667],  # Yak Kharka
        [83.6333, 28.7667],  # Kokhethanti
        [83.6783, 28.7583],  # Marpha
        [83.7270, 28.7808],  # Jomsom
        [83.6367, 28.5783],  # Tatopani
        [83.5733, 28.3433],  # Beni
    ]),

    "Everest High Passes Trek": make_line([
        [86.7278, 27.6868],  # Lukla
        [86.7133, 27.7400],  # Phakding
        [86.7139, 27.8033],  # Namche Bazaar
        [86.7639, 27.8361],  # Tengboche
        [86.8314, 27.8961],  # Dingboche
        [86.8667, 27.9500],  # Kongma La (5535m)
        [86.8064, 27.9561],  # Lobuche
        [86.8519, 28.0022],  # Everest Base Camp
        [86.8314, 27.9800],  # Gorak Shep
        [86.7500, 27.9167],  # Cho La (5420m)
        [86.6806, 27.9611],  # Gokyo
        [86.6000, 27.9833],  # Renjo La (5340m)
        [86.5667, 27.9500],  # Lungden
        [86.7139, 27.8033],  # Namche
        [86.7278, 27.6868],  # Lukla
    ]),

    "Numbur Cheese Circuit Trek": make_line([
        [86.5833, 27.5167],  # Phaplu
        [86.6333, 27.5500],  # Ringmo
        [86.6500, 27.5667],  # Junbesi
        [86.6833, 27.5833],  # Nunthala
        [86.6333, 27.6000],  # Numbur Cheese Factory
        [86.6000, 27.6000],  # Numbur Base
        [86.5833, 27.5167],  # Phaplu
    ]),

    "Guerrilla Trek": make_line([
        [83.5950, 28.2667],  # Baglung
        [83.5733, 28.3433],  # Beni
        [83.3833, 28.4333],  # Babiyachaur
        [83.2000, 28.4667],  # Dhorpatan
        [83.0500, 28.4833],  # Yaraha
        [82.9000, 28.5000],  # Musikot
        [82.8000, 28.5000],  # Thabang
        [82.6333, 28.6000],  # Rukumkot
    ]),

    "Kathmandu Valley Trek": make_line([
        [85.4383, 27.7717],  # Sundarijal
        [85.4167, 27.8000],  # Chisapani
        [85.4500, 27.8333],  # Pati Bhanjyang
        [85.5167, 27.9333],  # Kutumsang
        [85.5167, 27.7167],  # Nagarkot
        [85.5533, 27.6242],  # Dhulikhel
        [85.5167, 27.5833],  # Panauti
        [85.3240, 27.7172],  # Kathmandu
    ]),

    "Chepang Hill Trek": make_line([
        [84.8333, 27.6833],  # Bharatpur
        [84.8000, 27.7000],  # Chepang village
        [84.7500, 27.7167],  # Shaktikhor
        [84.7000, 27.7500],  # Gorkha foothills
        [84.6333, 28.0000],  # Gorkha
    ]),

    "Annapurna Circuit Trek": make_line([
        [84.3767, 28.2317],  # Besisahar
        [84.4167, 28.3167],  # Ngadi
        [84.3833, 28.3833],  # Bahundanda
        [84.3167, 28.4333],  # Chamje
        [84.2333, 28.5333],  # Chame
        [84.1667, 28.5833],  # Pisang
        [84.0833, 28.6500],  # Manang
        [84.0225, 28.6703],  # Manang village
        [83.9333, 28.7667],  # Thorong La Pass (5416m)
        [83.8700, 28.8167],  # Muktinath
        [83.7833, 28.8000],  # Kagbeni
        [83.7270, 28.7808],  # Jomsom
        [83.6783, 28.7583],  # Marpha
        [83.6367, 28.5783],  # Tatopani
        [83.6960, 28.3999],  # Ghorepani
        [83.7742, 28.3616],  # Nayapul
    ]),

    "Upper Dolpo Trek": make_line([
        [82.8167, 28.9833],  # Juphal
        [82.8833, 28.9333],  # Dunai
        [82.9000, 28.9833],  # Chhepka
        [82.9500, 29.0500],  # Tarakot
        [82.9500, 29.1167],  # Phoksundo Lake
        [82.8667, 29.1500],  # Ringmo
        [82.8542, 28.9694],  # Shey Gompa
        [82.8167, 28.9833],  # Juphal
    ]),

    "Mohare Danda Trek": make_line([
        [83.7742, 28.3616],  # Nayapul
        [83.7384, 28.3783],  # Tikhedhunga
        [83.6960, 28.3999],  # Ghorepani
        [83.7250, 28.4000],  # Mohare Danda ridge
        [83.7500, 28.4000],  # Mohare Danda peak
        [83.7717, 28.3833],  # Ghandruk
        [83.7742, 28.3616],  # Nayapul
    ]),

    "Pikey Peak and Dudh Kunda Trek": make_line([
        [86.5833, 27.5167],  # Phaplu
        [86.5667, 27.5000],  # Salleri
        [86.5500, 27.4333],  # Jhapre
        [86.6000, 27.4000],  # Pikey Peak (4065m)
        [86.6333, 27.4333],  # Jase Bhanjyang
        [86.7000, 27.4500],  # Salpa area
        [86.7167, 27.4500],  # Dudh Kunda (4560m)
        [86.5833, 27.5167],  # Phaplu
    ]),

    "Everest Base Camp Trek": make_line([
        [86.7278, 27.6868],  # Lukla
        [86.7133, 27.7400],  # Phakding
        [86.7139, 27.8033],  # Namche Bazaar
        [86.7258, 27.8186],  # Khumjung
        [86.7639, 27.8361],  # Tengboche
        [86.7975, 27.8589],  # Pangboche
        [86.8314, 27.8961],  # Dingboche
        [86.8064, 27.9561],  # Lobuche
        [86.8314, 27.9800],  # Gorak Shep
        [86.8519, 28.0022],  # Everest Base Camp (5364m)
        [86.7278, 27.6868],  # Lukla (return)
    ]),

    "Upper Mustang Trek": make_line([
        [83.7270, 28.7808],  # Jomsom
        [83.7786, 28.8344],  # Kagbeni
        [83.8000, 28.9167],  # Chele
        [83.8333, 28.9833],  # Ghami
        [83.9167, 29.1500],  # Tsarang
        [83.9500, 29.1833],  # Lo Manthang
        [84.0000, 29.2333],  # Dhi
        [83.9167, 29.0833],  # Ghara
        [83.7270, 28.7808],  # Jomsom
    ]),

    "Ganesh Himal Trek": make_line([
        [85.0667, 28.0833],  # Trishuli Bazaar
        [84.9333, 28.1167],  # Bidur
        [84.8667, 28.1833],  # Gorkha junction
        [84.9500, 28.2500],  # Tipling
        [85.0000, 28.3167],  # Somdang
        [85.0000, 28.3833],  # Ganesh Himal Base Camp
        [85.0667, 28.0833],  # Trishuli
    ]),

    "Manaslu Circuit Trek": make_line([
        [84.7000, 28.0167],  # Arughat
        [84.7833, 28.1167],  # Soti Khola
        [84.7500, 28.2333],  # Machhakhola
        [84.7333, 28.3500],  # Jagat
        [84.6833, 28.4167],  # Deng
        [84.6167, 28.5167],  # Namrung
        [84.6167, 28.5667],  # Samagaon
        [84.5833, 28.6333],  # Samdo
        [84.4500, 28.6667],  # Larkya La (5160m)
        [84.4000, 28.6167],  # Bhimtang
        [84.3833, 28.5167],  # Dharapani
        [84.3767, 28.2317],  # Besisahar
    ]),

    "Ruby Valley Trek": make_line([
        [85.0667, 28.0833],  # Trishuli
        [85.1667, 28.0167],  # Nuwakot
        [85.1833, 28.1333],  # Shertung
        [85.1500, 28.2167],  # Gatlang
        [85.1500, 28.2333],  # Somdang (ruby mines)
        [85.1833, 28.2500],  # Tipling
        [85.0667, 28.0833],  # Trishuli
    ]),

    "Rolwaling Tashi Laptsa Pass Trek": make_line([
        [86.0500, 27.6667],  # Charikot
        [86.0167, 27.7833],  # Simigaon
        [86.0333, 27.8500],  # Dongang
        [86.0833, 27.8833],  # Beding
        [86.1333, 27.9000],  # Na village
        [86.1667, 27.9333],  # Tsho Rolpa Lake
        [86.2667, 27.9500],  # Drolambau Glacier
        [86.3667, 27.9667],  # Tashi Laptsa Pass (5755m)
        [86.5500, 27.8833],  # Thame
        [86.7139, 27.8033],  # Namche
        [86.7278, 27.6868],  # Lukla
    ]),

    "Dhampus Sarangkot Trek": make_line([
        [83.9856, 28.2096],  # Pokhara
        [83.9667, 28.2333],  # Sarangkot
        [83.9333, 28.2500],  # Naudanda
        [83.9000, 28.2500],  # Kande
        [83.8833, 28.2500],  # Australian Camp
        [83.8717, 28.2633],  # Dhampus
        [83.9856, 28.2096],  # Pokhara
    ]),

    "Tamang Heritage Trail Trek": make_line([
        [85.3667, 28.1583],  # Syabrubesi
        [85.2833, 28.1833],  # Goljung
        [85.2167, 28.1833],  # Tatopani
        [85.1833, 28.2000],  # Thuman
        [85.1500, 28.2167],  # Gatlang
        [85.1833, 28.2333],  # Nagthali
        [85.2167, 28.2500],  # Briddim
        [85.3167, 28.2000],  # Lhagyen
        [85.3667, 28.1583],  # Syabrubesi
    ]),

    "Langtang Valley Trek": make_line([
        [85.3667, 28.1583],  # Syabrubesi
        [85.3833, 28.1667],  # Bamboo
        [85.4167, 28.1667],  # Lama Hotel
        [85.4667, 28.1833],  # Ghoda Tabela
        [85.5167, 28.2133],  # Langtang Village
        [85.5500, 28.2133],  # Mundu
        [85.5667, 28.2133],  # Kyanjin Gompa (3870m)
        [85.5833, 28.2333],  # Tserko Ri (5033m)
    ]),

    "Jomsom Muktinath Trek": make_line([
        [83.9856, 28.2096],  # Pokhara
        [83.7742, 28.3616],  # Nayapul
        [83.7200, 28.4400],  # Tatopani
        [83.6367, 28.5783],  # Tatopani hot springs
        [83.6500, 28.6333],  # Dana
        [83.6783, 28.7583],  # Marpha
        [83.7270, 28.7808],  # Jomsom
        [83.7786, 28.8344],  # Kagbeni
        [83.8700, 28.8167],  # Muktinath (3710m)
    ]),

    "Ghalegaun Trek": make_line([
        [84.5167, 28.2000],  # Khudi
        [84.4833, 28.2333],  # Bhulbhule
        [84.4500, 28.2500],  # Ghanpokhara
        [84.5000, 28.2500],  # Ghalegaun
        [84.5333, 28.2667],  # Ghalegaun upper
        [84.5167, 28.2000],  # Khudi
    ]),

    "Nar Phu Valley Trek": make_line([
        [84.3767, 28.2317],  # Besisahar
        [84.2333, 28.5333],  # Chame
        [84.1667, 28.5667],  # Koto (Nar Phu entry)
        [84.1167, 28.5833],  # Meta
        [84.0833, 28.6167],  # Junam
        [84.0333, 28.6500],  # Phu village
        [83.9833, 28.6833],  # Himlung Base
        [84.0500, 28.6333],  # Nar village
        [83.9333, 28.7667],  # Thorong La
        [83.8700, 28.8167],  # Muktinath
    ]),

    "Lower Dolpo Trek": make_line([
        [82.8167, 28.9833],  # Juphal
        [82.8833, 28.9333],  # Dunai
        [82.9167, 28.9833],  # Chhepka
        [82.9500, 29.0500],  # Tarakot
        [82.9500, 29.1167],  # Phoksundo Lake
        [82.9833, 29.1500],  # Ringmo
        [82.9500, 29.1167],  # Phoksundo (return)
        [82.8167, 28.9833],  # Juphal
    ]),

    "Helambu Trek": make_line([
        [85.4383, 27.7717],  # Sundarijal
        [85.4167, 27.8000],  # Chisapani
        [85.4500, 27.8333],  # Pati Bhanjyang
        [85.5167, 27.9333],  # Kutumsang
        [85.5500, 27.9667],  # Tharepati
        [85.5667, 27.9333],  # Mahankal
        [85.5833, 27.7833],  # Sermathang
        [85.5500, 27.8333],  # Tarke Gyang area
        [85.5500, 27.8000],  # Melamchi Pul
    ]),

    "Kanchenjunga Trek": make_line([
        [87.6667, 27.3500],  # Taplejung
        [87.7000, 27.4167],  # Chirwa
        [87.7333, 27.5333],  # Ghunsa
        [87.8333, 27.6000],  # Khambachen
        [87.8833, 27.6833],  # Lhonak
        [87.9941, 27.7041],  # Pangpema North Base Camp
        [87.8833, 27.6833],  # back to Lhonak
        [87.7833, 27.6500],  # Tseram
        [87.8167, 27.6167],  # Ramche
        [87.7500, 27.5667],  # Yalung Base Camp South
        [87.6667, 27.3500],  # Taplejung
    ]),

    "Gokyo Lake Trek": make_line([
        [86.7278, 27.6868],  # Lukla
        [86.7133, 27.7400],  # Phakding
        [86.7139, 27.8033],  # Namche Bazaar
        [86.7333, 27.8500],  # Mong La
        [86.7000, 27.8833],  # Dole
        [86.6833, 27.9167],  # Machhermo
        [86.6806, 27.9611],  # Gokyo (4790m)
        [86.6750, 27.9667],  # Gokyo Ri (5357m)
        [86.7139, 27.8033],  # Namche (return)
        [86.7278, 27.6868],  # Lukla
    ]),

    "Pikey Peak Trek": make_line([
        [86.5833, 27.5167],  # Phaplu
        [86.5667, 27.4500],  # Dhap
        [86.5500, 27.4333],  # Jhapre
        [86.5500, 27.4000],  # Pikey Peak (4065m)
        [86.5833, 27.5167],  # Phaplu (return)
    ]),

    "Everest Panorama Trek": make_line([
        [86.7278, 27.6868],  # Lukla
        [86.7133, 27.7400],  # Phakding
        [86.7139, 27.8033],  # Namche Bazaar
        [86.7258, 27.8186],  # Khumjung
        [86.7639, 27.8361],  # Tengboche
        [86.7258, 27.8186],  # Khumjung (return)
        [86.7139, 27.8033],  # Namche
        [86.7278, 27.6868],  # Lukla
    ]),

    "Annapurna Panorama Trek": make_line([
        [83.7742, 28.3616],  # Nayapul
        [83.7384, 28.3783],  # Tikhedhunga
        [83.7217, 28.3983],  # Ulleri
        [83.6960, 28.3999],  # Ghorepani
        [83.6904, 28.4003],  # Poon Hill (3210m)
        [83.7217, 28.4167],  # Tadapani
        [83.7717, 28.3833],  # Ghandruk
        [83.7742, 28.3616],  # Nayapul
    ]),

    "Langtang Valley Ganja La Pass Trek": make_line([
        [85.3667, 28.1583],  # Syabrubesi
        [85.4167, 28.1667],  # Lama Hotel
        [85.5167, 28.2133],  # Langtang Village
        [85.5667, 28.2133],  # Kyanjin Gompa
        [85.6000, 28.1833],  # Naya Kanga Base
        [85.6167, 28.1667],  # Ganja La Pass (5122m)
        [85.6333, 28.1333],  # Keldang
        [85.5667, 27.9833],  # Tarke Gyang
        [85.5500, 27.8333],  # Melamchi Pul
    ]),

    "Rupina La Pass Trek": make_line([
        [84.7000, 28.0167],  # Arughat
        [84.7833, 28.1167],  # Soti Khola
        [84.8333, 28.1167],  # Laprak
        [84.9500, 28.1667],  # Barpak
        [84.9500, 28.1500],  # Rupina La Pass (4660m)
        [84.9000, 28.1333],  # Tsum junction
        [84.7000, 28.0167],  # Arughat
    ]),

    "Khaptad Trek": make_line([
        [81.3333, 29.2667],  # Silgarhi
        [81.2833, 29.3167],  # Khaptad entry
        [81.2333, 29.3667],  # Khaptad Plateau
        [81.2000, 29.4000],  # Khaptad National Park center
        [81.1833, 29.4167],  # Khaptad Lake
        [81.2000, 29.4000],  # return
        [81.3333, 29.2667],  # Silgarhi
    ]),

    "Rara Lake Trek": make_line([
        [82.1833, 29.2750],  # Jumla
        [82.1500, 29.3167],  # Padmara
        [82.1333, 29.3667],  # Chere Khola
        [82.1000, 29.4333],  # Murma Top
        [82.0833, 29.5333],  # Rara Lake (2990m)
        [82.1000, 29.5167],  # Rara village
        [82.1833, 29.2750],  # Jumla (return)
    ]),

    "Annapurna Base Camp Trek": make_line([
        [83.7742, 28.3616],  # Nayapul
        [83.7384, 28.3783],  # Tikhedhunga
        [83.6960, 28.3999],  # Ghorepani
        [83.7217, 28.4167],  # Tadapani
        [83.7717, 28.3833],  # Ghandruk
        [83.8078, 28.4267],  # Chhomrong
        [83.8167, 28.4500],  # Sinuwa
        [83.8383, 28.4667],  # Dovan
        [83.8500, 28.4833],  # Himalaya Hotel
        [83.8581, 28.4958],  # Machhapuchhre Base Camp (3700m)
        [83.8781, 28.5303],  # Annapurna Base Camp (4130m)
        [83.7742, 28.3616],  # Nayapul (return)
    ]),

    "Royal Trek": make_line([
        [83.9856, 28.2096],  # Pokhara
        [84.0167, 28.2333],  # Bijaypur
        [84.0833, 28.2667],  # Kalikasthan
        [84.1000, 28.2833],  # Syaklung
        [84.1167, 28.3000],  # Thulokot
        [84.1000, 28.2667],  # Rupa Lake
        [83.9856, 28.2096],  # Pokhara
    ]),

    "Mardi Himal Trek": make_line([
        [83.9856, 28.2096],  # Pokhara
        [83.9000, 28.2667],  # Kande
        [83.9000, 28.3167],  # Forest Camp
        [83.9167, 28.3833],  # Low Camp
        [83.9378, 28.4511],  # High Camp (3580m)
        [83.9500, 28.4667],  # Mardi Himal Base Camp (4500m)
        [83.9856, 28.2096],  # Pokhara (return)
    ]),

    "Langtang Circuit Trek": make_line([
        [85.3667, 28.1583],  # Syabrubesi
        [85.4167, 28.1667],  # Lama Hotel
        [85.5167, 28.2133],  # Langtang Village
        [85.5667, 28.2133],  # Kyanjin Gompa
        [85.5833, 28.2333],  # Tserko Ri
        [85.5167, 28.1667],  # back south
        [85.4167, 28.0833],  # Gosaikund route
        [85.4167, 28.0833],  # Gosaikund Lake (4380m)
        [85.4833, 27.9667],  # Lauribina
        [85.5167, 27.9333],  # Kutumsang
        [85.4383, 27.7717],  # Sundarijal
    ]),

    "Tsum Valley Trek": make_line([
        [84.7000, 28.0167],  # Arughat
        [84.7833, 28.1167],  # Soti Khola
        [84.7333, 28.3500],  # Jagat
        [84.7500, 28.4833],  # Lokpa
        [84.8000, 28.5667],  # Chhekampar
        [84.8333, 28.6667],  # Nile
        [84.8667, 28.7500],  # Mu Gompa
        [84.8833, 28.7833],  # Tsum Valley head
        [84.7000, 28.0167],  # Arughat (return)
    ]),

    "Makalu Base Camp Trek": make_line([
        [87.1833, 27.3167],  # Tumlingtar
        [87.2000, 27.3667],  # Khandbari
        [87.1500, 27.5167],  # Num
        [87.0833, 27.6167],  # Seduwa
        [87.0833, 27.6833],  # Tashigaon
        [87.0500, 27.7333],  # Khongma
        [87.0500, 27.7833],  # Dobate
        [87.0667, 27.8333],  # Makalu Base Camp (5000m)
        [87.0883, 27.8897],  # Advanced BC
    ]),

    "Annapurna Circuit with Mesokanto Pass Trek": make_line([
        [84.3767, 28.2317],  # Besisahar
        [84.2333, 28.5333],  # Chame
        [84.0225, 28.6703],  # Manang
        [83.9333, 28.7667],  # Thorong La (5416m)
        [83.8700, 28.8167],  # Muktinath
        [83.8167, 28.9000],  # Mesokanto La (5100m)
        [83.7833, 28.9167],  # Jomsom approach
        [83.7270, 28.7808],  # Jomsom
        [83.6367, 28.5783],  # Tatopani
        [83.7742, 28.3616],  # Nayapul
    ]),

    "Everest Advanced Base Camp Trek": make_line([
        [86.7278, 27.6868],  # Lukla
        [86.7139, 27.8033],  # Namche
        [86.7639, 27.8361],  # Tengboche
        [86.8314, 27.8961],  # Dingboche
        [86.8064, 27.9561],  # Lobuche
        [86.8314, 27.9800],  # Gorak Shep
        [86.8519, 28.0022],  # EBC (5364m)
        [86.8528, 28.0250],  # Advanced Base Camp (6400m)
    ]),

    "Jiri to Everest Base Camp Trek": make_line([
        [86.2333, 27.6331],  # Jiri
        [86.3333, 27.6167],  # Sete
        [86.4000, 27.5833],  # Junbesi area
        [86.5833, 27.5167],  # Phaplu
        [86.7139, 27.8033],  # Namche Bazaar
        [86.7639, 27.8361],  # Tengboche
        [86.8314, 27.8961],  # Dingboche
        [86.8064, 27.9561],  # Lobuche
        [86.8519, 28.0022],  # Everest Base Camp
    ]),

    "Arun Valley Trek": make_line([
        [87.1833, 27.3167],  # Tumlingtar
        [87.2000, 27.3667],  # Khandbari
        [87.2167, 27.4333],  # Madi
        [87.1833, 27.5167],  # Num
        [87.1833, 27.5500],  # Hedangna
        [87.2000, 27.5833],  # Arun valley floor
        [87.1833, 27.3167],  # Tumlingtar (return)
    ]),

    "Upper Mustang Saribung Peak Climbing": make_line([
        [83.7270, 28.7808],  # Jomsom
        [83.7786, 28.8344],  # Kagbeni
        [83.8000, 28.9167],  # Chele
        [83.9500, 29.1833],  # Lo Manthang
        [84.0167, 29.2167],  # Marang
        [83.9333, 29.0500],  # Ghuma Thanti
        [83.9167, 29.0833],  # Saribung Base Camp
        [83.9000, 29.1000],  # Saribung Peak (6346m)
    ]),

    "Bhairav Kunda Trek": make_line([
        [85.5500, 27.8333],  # Melamchi Pul
        [85.5667, 27.9333],  # Tarke Gyang
        [85.6000, 27.9500],  # Sermathang
        [85.6667, 27.9500],  # Panch Pokhari area
        [85.7000, 27.9333],  # Yangri
        [85.7833, 27.9333],  # Bhairav Kunda (4200m)
        [85.5500, 27.8333],  # return
    ]),

    "Everest Base Camp with Gokyo Valley Trek": make_line([
        [86.7278, 27.6868],  # Lukla
        [86.7139, 27.8033],  # Namche Bazaar
        [86.6806, 27.9611],  # Gokyo Lakes
        [86.6750, 27.9667],  # Gokyo Ri (5357m)
        [86.7500, 27.9167],  # Cho La Pass (5420m)
        [86.8064, 27.9561],  # Lobuche
        [86.8519, 28.0022],  # Everest Base Camp
        [86.8314, 27.9800],  # Gorak Shep
        [86.7278, 27.6868],  # Lukla (return)
    ]),

    "Panch Pokhari Trek": make_line([
        [85.5500, 27.8333],  # Melamchi Pul
        [85.5667, 27.9833],  # Tarke Gyang
        [85.5833, 27.9500],  # Sermathang
        [85.6000, 27.9500],  # Panch Pokhari approach
        [85.6000, 27.9500],  # Panch Pokhari Lakes (4100m)
        [85.5500, 27.8333],  # Melamchi Pul (return)
    ]),

    "Manaslu and Tsum Valley Trek": make_line([
        [84.7000, 28.0167],  # Arughat
        [84.7833, 28.1167],  # Soti Khola
        [84.7333, 28.3500],  # Jagat
        [84.8667, 28.7500],  # Tsum Valley (Mu Gompa)
        [84.7333, 28.3500],  # back to Jagat
        [84.6167, 28.5667],  # Samagaon
        [84.5833, 28.6333],  # Samdo
        [84.4500, 28.6667],  # Larkya La (5160m)
        [84.3833, 28.5167],  # Dharapani
        [84.3767, 28.2317],  # Besisahar
    ]),
}


class Command(BaseCommand):
    help = 'Populate route_geojson for all treks with key waypoint coordinates'

    def handle(self, *args, **kwargs):
        updated = 0
        skipped = 0
        not_found = []

        for trek_name, geojson in ROUTES.items():
            try:
                trek = Trek.objects.get(trek_name=trek_name)
                trek.route_geojson = geojson
                trek.save(update_fields=['route_geojson'])
                updated += 1
                self.stdout.write(f'  ✓ {trek_name}')
            except Trek.DoesNotExist:
                not_found.append(trek_name)
                skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f'\nDone — {updated} routes updated, {skipped} not found.'
        ))
        if not_found:
            self.stdout.write('Not found:')
            for name in not_found:
                self.stdout.write(f'  - {name}')
