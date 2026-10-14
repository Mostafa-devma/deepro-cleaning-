DeepPro — نسخة كاملة للمراجعة والتعديل

طريقة الفتح:
1. فك ضغط الملف بالكامل أولاً.
2. افتح index.html بواسطة Chrome أو Firefox أو Edge، ويفضل على الكمبيوتر.
3. احتفظ بالمجلدات assets و css و js بجانب ملفات الصفحات حتى تظهر الصور والتصميم.
لا تحتاج هذه النسخة إلى خادم لتصفح الكتالوج.
روابط واتساب والخطوط (Google Fonts) تحتاج اتصالاً بالإنترنت.

الصفحات:
- index.html: الرئيسية (بحث، مساعد "شو المشكلة يلي عندك؟"، شريط منتجات، الخريطة).
- catalog.html: كل المنتجات مع البحث، الترتيب حسب السعر، وفلتر "بس يلي إلو سعر".
- catalog-professional.html، catalog-tools.html، catalog-daily.html، catalog-fragrances.html، catalog-soap.html: صفحة لكل قسم.
- about.html: من نحن.
- faq.html: الأسئلة الشائعة.
- contact.html: تواصل معنا (نموذج يجهّز رسالة واتساب).
- 404.html: صفحة "غير موجودة" للاستضافة.

لوحة التحكم:
على الموقع المنشور: افتح <رابط الموقع>/admin واكتب كلمة السر.
- «حفظ» بيبعت التعديلات على GitHub، وVercel بيحدّث الموقع خلال دقيقة تقريبًا.
- لازم مرّة وحدة تزيد بإعدادات المشروع على Vercel (Settings > Environment Variables):
  ADMIN_PASSWORD = كلمة السر يلي بتختارها
  GITHUB_TOKEN   = توكن GitHub (fine-grained) على الـ repo بصلاحية Contents: Read and write
  وبعدين Redeploy.
على الكمبيوتر بلا إنترنت: افتح admin.html من المجلد بـ Chrome أو Edge، اربط مجلد الموقع، و«حفظ» بيكتب الملفات مباشرة.
- «تراجع» (Ctrl+Z) بيرجّع آخر تعديل قبل الحفظ، و«نسخة احتياطية» بينزّل نسخة من البيانات.
- الصور الكبيرة بتتصغّر تلقائيًا قبل الرفع.

سلّة الطلب:
الزائر بيزيد المنتجات عالسلة (بتنحفظ بمتصفّحه)، وبيبعت الطلب كلّه مع المجموع برسالة واتساب وحدة على 96176997610.
ما في دفع ولا تخزين على الموقع.

الملفات المشتركة:
- css/style.css: كل التصميم.
- js/catalog-data.js: بيانات المنتجات والأسعار والصور. عدّل هنا فقط، وكل الصفحات تتحدّث تلقائياً.
- js/main.js: الكتالوج، البحث والفلاتر، السلة، العرض المكبّر للصور، القائمة على الموبايل، ونموذج التواصل.
- assets/: الصور والشعارات (deeppro-logo-horizontal-dark-text.png للخلفية البيضاء، deeppro-logo-horizontal-light.png للخلفية الداكنة).
- catalog-data.json: نسخة منظمة من بيانات المنتجات للمصمم.
- index-old.html: نسخة احتياطية من الموقع القديم (صفحة واحدة).

ملاحظات للمصمم:
الموقع عربي باتجاه RTL، ثابت، ولا يعتمد على إطار عمل أو قاعدة بيانات.
تعديل catalog-data.json وحده لا يغيّر العرض؛ يجب مزامنة البيانات في js/catalog-data.js.
الترويسة والتذييل مكررة في كل صفحة HTML؛ عند تعديل رابط أو رقم فيها، عدّله في كل الصفحات.
للاستضافة الثابتة ارفع كل الملفات والمجلدات مع الحفاظ على المسارات النسبية.
هذه نسخة مستقلة: تعديلها لا يحدّث الموقع المنشور تلقائياً.

Developer notes:
Buildless static multi-page site. Open index.html after extracting the whole ZIP.
Catalog data: js/catalog-data.js (const categories). Shared styles: css/style.css. Shared script: js/main.js.
Each page sets <body data-page="..."> (and data-category on category pages); main.js renders from that.
Header and footer markup is repeated in every page; keep them in sync when editing.
Basket: stored in localStorage key 'deeppro-cart'; sent as one WhatsApp message.
Admin: /admin (vercel.json rewrite to admin.html) + js/admin.js + css/admin.css + api/admin.js.
Online: api/admin.js checks ADMIN_PASSWORD and commits to GitHub with GITHUB_TOKEN (optional GITHUB_REPO, GITHUB_BRANCH); Vercel redeploys on push.
Local (file://): uses the File System Access API (Chrome/Edge) to write js/catalog-data.js, catalog-data.json, assets/ uploads and new catalog-<id>.html pages (copied from an existing category page). Category page headers and footer category links are rendered from the data.
Old single-page links (index.html#category-xxx) redirect to catalog-xxx.html.
No dependencies or build commands are required. Upload everything to any static host.
