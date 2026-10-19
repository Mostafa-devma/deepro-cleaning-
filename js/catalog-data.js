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
    "products": [
      {
        "name": "سائل غسيل Jamrex",
        "description": "سائل عالي الجودة مع رغوة كثيفة",
        "size": "3 litre",
        "image": "assets/image-60907b1a.jpg",
        "price": 7.5,
        "priceDisplay": "7.50"
      },
      {
        "name": "سائل غسيل Elvera",
        "description": "ينظف اصعب البقع، يحمي ويثبت الألوان",
        "size": "3 litre",
        "image": "assets/image-5d57c8c6.jpg",
        "price": 6
      },
      {
        "name": "سائل غسيل Best clean",
        "description": "Deep clean *3  100%result",
        "size": "3 litre",
        "image": "assets/image-37f4721e.jpg",
        "price": 4.5,
        "priceDisplay": "4.50"
      },
      {
        "name": "معطر ومطري غسيل Jamrex",
        "description": "خطوة نحو النظافة",
        "size": "3 litre",
        "image": "assets/image-482246b.jpg",
        "price": 6.5,
        "priceDisplay": "6.50"
      },
      {
        "name": "ملطف ومعطر الأقمشة",
        "description": "حب من التجربة الاولى",
        "size": "3 litre",
        "image": "assets/image-351a4787.jpg",
        "price": 6
      },
      {
        "name": "مطري ومعطر  Best clean",
        "description": "Ultra soft",
        "size": "3 litre",
        "image": "assets/image-70ac599.jpg",
        "price": 4
      },
      {
        "name": "مزيل البقع من Jamrex",
        "description": "يزيل اصعب البقع عن الاقمشة",
        "size": "250Ml - 100Ml",
        "image": "assets/image-1ba6b7e9.jpg",
        "price": null
      },
      {
        "name": "مزيل البقع من Magic touch",
        "description": "يزيل البقع العنيدة عن الملابس، المفروشات ، السجاد",
        "size": "250Ml - 100Ml",
        "image": "assets/image-b968b3b4.jpg",
        "price": null
      },
      {
        "name": "بخاخ مزيل التجاعيد",
        "description": "بديل المكواة",
        "size": "500 ml",
        "image": "assets/image-c4220e7a.jpg",
        "price": 7
      },
      {
        "name": "منظف الغسالات والجلايات",
        "description": "يزيل العفن والكلس من الجرن الداخلي",
        "size": "1 Litre",
        "image": "assets/image-a466f364.jpg",
        "price": 8
      }
    ],
    "image": "assets/image-d4aad579.jpg",
    "imagePosition": "center 55%"
  },
  {
    "id": "section-6",
    "title": "منظفات المطابخ والأواني",
    "description": "سوائل الجلي، منظفات الأفران والغاز، مزيلات الدهون والشحوم ملمع الستانلس والالومينيوم، ملح الجلايات",
    "products": [
      {
        "name": "سائل الجلي Jamrex",
        "description": "خطوة ممتازة نحو النظافة",
        "size": "3.7 litre",
        "image": "assets/image-dd05e87d.jpg",
        "price": 8
      },
      {
        "name": "سائل الجلي Elvera",
        "description": "حب من التجربة الاولى، رغوة لا تضاهى",
        "size": "3 litre",
        "image": "assets/image-f16fde7f.jpg",
        "price": 5.5,
        "priceDisplay": "5.50"
      },
      {
        "name": "سائل الجلي Best clean",
        "description": "ملك التوفير ، نتائج مرضية",
        "size": "3 litre",
        "image": "assets/image-60cdd380.jpg",
        "price": 3.5,
        "priceDisplay": "3.50"
      },
      {
        "name": "سائل الجلي Jamrex",
        "size": "2 litre",
        "image": "assets/image-6cc9ed7a.jpg",
        "price": 5
      },
      {
        "name": "سائل الجلي Elvera",
        "size": "800 ml",
        "image": "assets/image-786a3fed.jpg",
        "price": 1.5,
        "priceDisplay": "1.50"
      },
      {
        "name": "سائل الجلي Best clean",
        "size": "700ml",
        "image": "assets/image-1ddf48c0.jpg",
        "price": 1
      },
      {
        "name": "سائل الجلي Jamrex",
        "size": "700ml",
        "image": "assets/image-e069ad5b.jpg",
        "price": 2
      },
      {
        "name": "ملمع جل الستانلس والالومينيوم",
        "description": "استعد لمعان مطبخك بلمسة واحدة",
        "size": "500 ml",
        "image": "assets/image-591de8b3.jpg",
        "price": 8
      },
      {
        "name": "منظف الغاز  ovenox",
        "size": "600ml",
        "image": "assets/image-51c8fabb.jpg",
        "price": 4,
        "description": "مزيل الزيوت والشحوم المتراكمة"
      },
      {
        "name": "Deep cleaning",
        "description": "متعدد الوظائف، بدون رائحة او طعمة ، مزيل العفن والزيوت والشحوم المتراكمة بكفاءة عالية، آمن في الاستخدام",
        "size": "500 ml",
        "image": "assets/image-316ab6cf.jpg",
        "price": 6
      },
      {
        "name": "ملح الجلايات",
        "description": "مزيل التكلسات من أحواض الجلايات والغسالات",
        "size": "1kg",
        "image": "assets/image-c79d0c2.jpg",
        "price": 2
      },
      {
        "name": "Quita grasas",
        "description": "صناعة اسبانية مزيل الشحوم والدهون وفعال على الالبسة المتسخة",
        "image": "assets/image-9354f655.jpg",
        "price": 4.5,
        "priceDisplay": "4.50"
      }
    ],
    "imagePosition": "center 55%",
    "image": "assets/image-510310e3.jpg"
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
        "price": 5,
        "description": "مضادة للقشرة"
      },
      {
        "name": "صابونة السدر",
        "image": "assets/soap-sidr.jpg",
        "price": 5,
        "description": "تقوي الشعر وتوقف تساقطه"
      },
      {
        "name": "صابونة زيت الغار",
        "image": "assets/soap-laurel.jpg",
        "price": 5
      },
      {
        "name": "صابونة دهن العود",
        "image": "assets/soap-oud.jpg",
        "price": 5,
        "description": "معطرة ومنعمة للجلد"
      },
      {
        "name": "صابونة قشر الرمان",
        "image": "assets/soap-pomegranate.jpg",
        "price": 5,
        "description": "تبييض الأماكن الحساسة"
      },
      {
        "name": "صابونة البرتقال",
        "description": "مشبعة ب الفيتامين ب",
        "image": "assets/fb-img-1792242423857.jpg",
        "price": 5
      },
      {
        "name": "صابونة الصبير",
        "description": "مهدئة للحروق",
        "image": "assets/fb-img-1792242449606.jpg",
        "price": 5
      },
      {
        "name": "صابونة البحر الميت",
        "description": "تزيل دهون البشرة الزائدة",
        "image": "assets/fb-img-1792242427660.jpg",
        "price": 5
      },
      {
        "name": "صابونة الشاي الاخضر",
        "description": "تخلص البشرة من الجفاف",
        "image": "assets/fb-img-1792242452425.jpg",
        "price": 5
      },
      {
        "name": "صابونة الكركم",
        "description": "تخفف من آثار حب الشباب",
        "image": "assets/img-20260425-wa0050.jpg",
        "price": 5
      }
    ],
    "image": "assets/fb-img-1791971376196.jpg",
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
