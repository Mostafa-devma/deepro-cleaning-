/* DeepPro catalog data — edit products, prices and photos here, or use admin.html. Every page reads from this file. */
const categories=[
  {
    "id": "professional",
    "title": "أدوية التنظيف الاحترافية",
    "description": "حلول لمشاكل التنظيف الصعبة والعناية بالأسطح والأقمشة.",
    "color": "#e3eef0",
    "accent": "#447985",
    "icon": "spark",
    "products": [],
    "image": "assets/category-professional.jpg"
  },
  {
    "id": "daily",
    "title": "الغسيل والعناية بالملابس",
    "description": "منتجات الغسيل ومعطراتها، مزيل البقع والتجاعيد",
    "color": "#e6eee8",
    "accent": "#548775",
    "icon": "drop",
    "products": [],
    "image": "assets/image-d4aad579.jpg",
    "imagePosition": "center 55%"
  },
  {
    "id": "section-6",
    "title": "منظفات المطابخ والأواني",
    "description": "سوائل الجلي، منظفات الأفران والغاز، مزيلات الدهون والشحوم ملمع الستانلس والالومينيوم، ملح الجلايات",
    "products": [],
    "imagePosition": "center 55%"
  },
  {
    "id": "section-7",
    "title": "منظفات الحمامات وإزالة لترسبات",
    "description": "مزيل التكلسات، مزيل العفن، مزيل الصدأ، تجهيزات الحمامات",
    "products": [],
    "imagePosition": "center 55%"
  },
  {
    "id": "section-8",
    "title": "منظفات الأسطح وتلميعها",
    "description": "منظفات الأرضيات ومعطراتها، منظف الزجاج، مانع الضباب، ملمع الخشب والبلاستيك، مزيل صدأ الحديد .",
    "products": [],
    "imagePosition": "center 55%"
  },
  {
    "id": "section-9",
    "title": "العناية بالمفروشات والسيارات والأحذية",
    "description": "منظف الكنب والسجاد والأقمشة، مزيلات البقع، مزيل اصفرار المصابيح، منظفات الاحذية",
    "products": [],
    "imagePosition": "center 55%"
  },
  {
    "id": "fragrances",
    "title": "العطور والمعطّرات",
    "description": "للجو، وللاستخدام الشخصي، وللحمّامات والسيارات.",
    "color": "#eeeae1",
    "accent": "#8b7956",
    "icon": "drop",
    "products": [
      {
        "name": "عطر منزلي بخّاخ",
        "image": "assets/home-fragrance-spray.png",
        "price": 6,
        "priceUnit": "للعبوة الواحدة",
        "description": "عطر منزلي بخّاخ.",
        "imageCaption": "صورة التشكيلة — اختر الرائحة عبر واتساب."
      },
      {
        "name": "عطر منزلي بالأعواد",
        "image": "assets/home-fragrance-reeds.png",
        "price": 7,
        "priceUnit": "للعبوة الواحدة",
        "description": "عطر منزلي بالأعواد.",
        "imageCaption": "صورة التشكيلة — اختر الرائحة عبر واتساب."
      },
      {
        "name": "عطورات عصام اللبان — 100 مل",
        "image": "assets/issam-labban-perfumes.png",
        "price": 10,
        "size": "100 مل",
        "description": "عطورات عصام اللبان",
        "imageCaption": "صورة التشكيلة — اختر الرائحة عبر واتساب."
      },
      {
        "name": "عطورات عصام اللبان — 30 مل",
        "image": "assets/issam-labban-perfumes.png",
        "price": 5,
        "size": "30 مل",
        "description": "عطورات عصام اللبان",
        "imageCaption": "صورة التشكيلة — اختر الرائحة عبر واتساب."
      },
      {
        "name": "معطّر حبيبات بلاك أودور",
        "image": "assets/fragrance-beads-black-odor.png",
        "price": 6,
        "priceUnit": "للعبوة الواحدة",
        "imageCaption": "صورة التشكيلة — اختر الرائحة عبر واتساب."
      },
      {
        "name": "معطّر سيارات بلاك أودور",
        "image": "assets/car-fragrance-black-odor.png",
        "price": 7,
        "priceUnit": "للعبوة الواحدة",
        "imageCaption": "صورة التشكيلة — اختر الرائحة عبر واتساب."
      }
    ],
    "image": "assets/category-fragrances.png",
    "imagePosition": "center 60%"
  },
  {
    "id": "soap",
    "title": "الصابون البلدي من زيوت طبيعية",
    "description": "خمسة أصناف مختارة من تشكيلة الصابون البلدي.",
    "color": "#f1e9e3",
    "accent": "#a47c60",
    "icon": "soap",
    "products": [
      {
        "name": "صابونة إكليل الجبل",
        "image": "assets/soap-rosemary.jpg",
        "price": 5
      },
      {
        "name": "صابونة السدر",
        "image": "assets/soap-sidr.jpg",
        "price": 5
      },
      {
        "name": "صابونة زيت الغار",
        "image": "assets/soap-laurel.jpg",
        "price": 5
      },
      {
        "name": "صابونة دهن العود",
        "image": "assets/soap-oud.jpg",
        "price": 5
      },
      {
        "name": "صابونة قشر الرمان",
        "image": "assets/soap-pomegranate.jpg",
        "price": 5
      }
    ],
    "image": "assets/category-soap.png",
    "imagePosition": "center 55%"
  },
  {
    "id": "tools",
    "title": "أدوات ومستلزمات التنظيف",
    "description": "مماسح، مكانس، فراشي، اسفنج جلي، سيف ، ليف حمام، شفق مايكروفايبر ،",
    "color": "#edf0e9",
    "accent": "#667b50",
    "icon": "spark",
    "products": [
      {
        "name": "إسفنج جلي Arix Splendelli",
        "image": "assets/sponge-arix.jpg",
        "price": 1,
        "size": "عبوة من قطعتين",
        "priceUnit": "للعبوة (قطعتان)"
      },
      {
        "name": "إسفنج جلي Casalina الملوّن",
        "image": "assets/sponge-casalina-multicolor.jpg",
        "price": 3,
        "size": "عبوة من 3 قطع",
        "priceUnit": "للعبوة (3 قطع)"
      },
      {
        "name": "إسفنج جلي Casalina الأصفر والأخضر",
        "image": "assets/sponge-casalina-yellow-green.jpg",
        "price": 0.7,
        "priceDisplay": "0.70",
        "size": "عبوة من قطعتين",
        "priceUnit": "للعبوة (قطعتان)"
      },
      {
        "name": "سيف جلي Casalina Inox — 4 قطع",
        "image": "assets/scourer-inox-4pcs.jpg",
        "price": null
      },
      {
        "name": "سيف جلي Casalina مقطّع — 8 قطع",
        "image": "assets/scourer-steelwool-8pcs.jpg",
        "price": null
      },
      {
        "name": "سيف جلي Casalina Inox — قطعتان",
        "image": "assets/scourer-inox-2pcs.jpg",
        "price": null
      },
      {
        "name": "سيف جلي Casalina Inox XL — 40 غرام",
        "image": "assets/scourer-inox-xl-40g.jpg",
        "price": null
      }
    ],
    "image": "assets/category-tools.png",
    "imagePosition": "center 55%"
  },
  {
    "id": "section-10",
    "title": "معدات تنظيف إحترافية",
    "description": "معدات عالية الجودة ومكفولة",
    "products": [],
    "imagePosition": "center 55%"
  }
];
