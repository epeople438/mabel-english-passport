import { originalLessons } from "./original-lessons";

export type DialogueLine = {
  speaker: string;
  zh: string;
  en: string;
};

export type Lesson = {
  id: number;
  title: string;
  dialogue: readonly DialogueLine[];
  expressions: readonly string[];
  unitId: number;
  mission?: string;
};

export type Unit = {
  id: number;
  titleZh: string;
  titleEn: string;
  kicker: string;
  image: string;
  start: number;
  end: number;
  accent: string;
  icon: string;
  singapore?: boolean;
};

export const units: Unit[] = [
  { id: 1, titleZh: "认识与社交", titleEn: "Meet & Connect", kicker: "自信地开启一段新对话", image: "/images/units/unit-01-social.webp", start: 1, end: 6, accent: "#ef745e", icon: "👋" },
  { id: 2, titleZh: "家庭日常", titleEn: "Everyday at Home", kicker: "从早安到晚安的生活表达", image: "/images/units/unit-02-family.webp", start: 7, end: 12, accent: "#e9a93f", icon: "🏡" },
  { id: 3, titleZh: "校园与课堂", titleEn: "School Life", kicker: "听懂老师，也敢举手提问", image: "/images/units/unit-03-school.webp", start: 13, end: 18, accent: "#4e9b91", icon: "✏️" },
  { id: 4, titleZh: "朋友与娱乐", titleEn: "Friends & Fun", kicker: "邀请、选择、鼓励与分享", image: "/images/units/unit-04-friends.webp", start: 19, end: 24, accent: "#b67bc6", icon: "🎲" },
  { id: 5, titleZh: "购物与公共生活", titleEn: "Shopping Around", kicker: "询价、试穿、付款不慌张", image: "/images/units/unit-05-shopping.webp", start: 25, end: 30, accent: "#df7a82", icon: "🛍️" },
  { id: 6, titleZh: "餐饮与健康饮食", titleEn: "Eating Out", kicker: "点餐、过敏与打包都能说", image: "/images/units/unit-06-dining.webp", start: 31, end: 36, accent: "#e28f3d", icon: "🍜" },
  { id: 7, titleZh: "情绪、健康与安全", titleEn: "Feel Safe", kicker: "表达感受，也会保护自己", image: "/images/units/unit-07-health.webp", start: 37, end: 43, accent: "#5b9fb1", icon: "💛" },
  { id: 8, titleZh: "城市交通与问路", titleEn: "Move Around", kicker: "问路、换乘与坐对方向", image: "/images/units/unit-08-transport.webp", start: 44, end: 49, accent: "#4b91a8", icon: "🚇" },
  { id: 9, titleZh: "机场与乘机", titleEn: "At the Airport", kicker: "从值机到飞行全程开口", image: "/images/units/unit-09-airport.webp", start: 50, end: 56, accent: "#567fb2", icon: "✈️" },
  { id: 10, titleZh: "入境、酒店与住宿", titleEn: "Arrive & Stay", kicker: "顺利入境，也能解决房间问题", image: "/images/units/unit-10-hotel.webp", start: 57, end: 63, accent: "#c18a55", icon: "🧳" },
  { id: 11, titleZh: "景点与游乐园", titleEn: "Explore & Play", kicker: "买票、排队、拍下旅途回忆", image: "/images/units/unit-11-attractions.webp", start: 64, end: 69, accent: "#ee7955", icon: "🎡" },
  { id: 12, titleZh: "自然表达与口语拓展", titleEn: "Speak Naturally", kicker: "把昨天、明天和喜欢说清楚", image: "/images/units/unit-12-speaking.webp", start: 70, end: 75, accent: "#8873ad", icon: "💬" },
  { id: 13, titleZh: "新加坡旅行任务", titleEn: "Singapore Mission", kicker: "把英语真正带到新加坡使用", image: "/images/units/unit-13-singapore.webp", start: 76, end: 87, accent: "#d95f52", icon: "🦁", singapore: true },
];

const singaporeLessons: Omit<Lesson, "unitId">[] = [
  {
    id: 76,
    title: "在樟宜机场看室内瀑布",
    mission: "抵达后的第一项任务：问清路线，找到室内瀑布。",
    dialogue: [
      { speaker: "Mabel", zh: "不好意思，请问室内瀑布怎么走？", en: "Excuse me. How do we get to the indoor waterfall?" },
      { speaker: "Staff", zh: "过天桥一直走。", en: "Go across the link bridge and walk straight." },
      { speaker: "Mabel", zh: "从这里走路要多久？", en: "How long does it take to walk from here?" },
      { speaker: "Staff", zh: "大约十分钟。", en: "About ten minutes." },
      { speaker: "Mabel", zh: "太好了，谢谢您的帮助。", en: "Great. Thank you for your help." },
    ],
    expressions: ["How do we get to…? 我们怎样去……？", "How long does it take? 需要多长时间？"],
  },
  {
    id: 77,
    title: "搭乘 MRT",
    mission: "认准方向，使用同一张卡进站和出站。",
    dialogue: [
      { speaker: "Mabel", zh: "请问去市中心坐这条线吗？", en: "Excuse me. Is this the line to the city centre?" },
      { speaker: "Local", zh: "是的，在前面站台乘车。", en: "Yes. Take the train from the platform ahead." },
      { speaker: "Mabel", zh: "我需要换乘吗？", en: "Do I need to change trains?" },
      { speaker: "Local", zh: "需要，在下一站换乘。", en: "Yes. Change at the next station." },
      { speaker: "Mabel", zh: "明白了，非常感谢。", en: "Got it. Thank you very much." },
    ],
    expressions: ["Is this the line to…? 这是去……的线路吗？", "Do I need to change trains? 我需要换乘吗？"],
  },
  {
    id: 78,
    title: "询问地铁出口",
    mission: "从正确出口前往滨海湾。",
    dialogue: [
      { speaker: "Mabel", zh: "哪个出口离滨海湾最近？", en: "Which exit is closest to Marina Bay?" },
      { speaker: "Staff", zh: "请走右边的出口。", en: "Please take the exit on the right." },
      { speaker: "Mabel", zh: "出去以后要过马路吗？", en: "Do we cross the road after we exit?" },
      { speaker: "Staff", zh: "不用，沿着有盖走道走。", en: "No. Follow the covered walkway." },
      { speaker: "Mabel", zh: "好的，谢谢您。", en: "Okay. Thank you." },
    ],
    expressions: ["Which exit is closest to…? 哪个出口离……最近？", "Follow the… 沿着……走。"],
  },
  {
    id: 79,
    title: "在小贩中心找座位",
    mission: "礼貌确认空位，再坐下来享用美食。",
    dialogue: [
      { speaker: "Mabel", zh: "不好意思，这里有人坐吗？", en: "Excuse me. Is anyone sitting here?" },
      { speaker: "Local", zh: "没有，你们可以坐。", en: "No. You can sit here." },
      { speaker: "Mabel", zh: "我们可以把托盘放在这边吗？", en: "Can we put our trays on this side?" },
      { speaker: "Local", zh: "当然可以。", en: "Of course." },
      { speaker: "Mabel", zh: "谢谢您。", en: "Thank you." },
    ],
    expressions: ["Is anyone sitting here? 这里有人坐吗？", "Can we put… here? 我们可以把……放这里吗？"],
  },
  {
    id: 80,
    title: "点一份海南鸡饭",
    mission: "点当地美食，并把自己的口味说清楚。",
    dialogue: [
      { speaker: "Server", zh: "你好，想点什么？", en: "Hello. What would you like?" },
      { speaker: "Mabel", zh: "请给我一份海南鸡饭。", en: "I’d like one Hainanese chicken rice, please." },
      { speaker: "Server", zh: "要辣椒酱吗？", en: "Would you like chilli sauce?" },
      { speaker: "Mabel", zh: "请把辣椒酱放在旁边。", en: "Please put the chilli sauce on the side." },
      { speaker: "Server", zh: "好的。", en: "Sure." },
    ],
    expressions: ["I’d like one…, please. 请给我一份……", "on the side 放在旁边、分开放"],
  },
  {
    id: 81,
    title: "点饮料少冰",
    mission: "在炎热天气里，清楚表达甜度和冰量。",
    dialogue: [
      { speaker: "Server", zh: "想喝点什么？", en: "What would you like to drink?" },
      { speaker: "Mabel", zh: "请给我一杯青柠汁。", en: "A lime juice, please." },
      { speaker: "Server", zh: "要正常冰量吗？", en: "Would you like the regular amount of ice?" },
      { speaker: "Mabel", zh: "请少冰，也少一点糖。", en: "Less ice and less sugar, please." },
      { speaker: "Server", zh: "没问题。", en: "No problem." },
    ],
    expressions: ["Less ice, please. 请少冰。", "less sugar 少一点糖"],
  },
  {
    id: 82,
    title: "在鱼尾狮公园拍照",
    mission: "请别人帮忙拍下完整的旅行纪念照。",
    dialogue: [
      { speaker: "Mabel", zh: "不好意思，可以帮我们拍张照片吗？", en: "Excuse me. Could you take a photo of us?" },
      { speaker: "Local", zh: "当然可以。", en: "Of course." },
      { speaker: "Mabel", zh: "请把鱼尾狮和喷水都拍进去。", en: "Please include the Merlion and the water spray." },
      { speaker: "Local", zh: "好的，笑一笑！", en: "Sure. Smile!" },
      { speaker: "Mabel", zh: "谢谢，可以再拍一张吗？", en: "Thanks. Could you take one more?" },
    ],
    expressions: ["Could you take a photo of us? 可以帮我们拍照吗？", "Please include… 请把……拍进去。"],
  },
  {
    id: 83,
    title: "参观滨海湾花园",
    mission: "确认电子票和参观入口。",
    dialogue: [
      { speaker: "Mabel", zh: "你好，我们有电子票。", en: "Hello. We have e-tickets." },
      { speaker: "Staff", zh: "请打开二维码。", en: "Please open the QR codes." },
      { speaker: "Mabel", zh: "这个入口去云雾林吗？", en: "Is this the entrance to Cloud Forest?" },
      { speaker: "Staff", zh: "是的，请从这里进去。", en: "Yes. Please enter here." },
      { speaker: "Mabel", zh: "谢谢，我们很期待。", en: "Thank you. We’re excited." },
    ],
    expressions: ["Is this the entrance to…? 这是去……的入口吗？", "We’re excited. 我们很期待。"],
  },
  {
    id: 84,
    title: "突然下热带雨",
    mission: "遇到阵雨时，询问最近的避雨地点。",
    dialogue: [
      { speaker: "Mabel", zh: "雨突然下得很大。", en: "It suddenly started raining heavily." },
      { speaker: "Mum", zh: "我们先找个有遮挡的地方。", en: "Let’s find somewhere covered." },
      { speaker: "Mabel", zh: "最近的室内入口在哪里？", en: "Where is the nearest indoor entrance?" },
      { speaker: "Staff", zh: "前面左转就到了。", en: "It’s just ahead on the left." },
      { speaker: "Mabel", zh: "谢谢，我们带了雨伞。", en: "Thank you. We have umbrellas." },
    ],
    expressions: ["somewhere covered 有遮挡的地方", "Where is the nearest…? 最近的……在哪里？"],
  },
  {
    id: 85,
    title: "在动物园问动物",
    mission: "找到喜欢的动物，并了解喂食活动。",
    dialogue: [
      { speaker: "Mabel", zh: "请问红毛猩猩在哪里？", en: "Excuse me. Where can we see the orangutans?" },
      { speaker: "Staff", zh: "沿着这条小路一直走。", en: "Follow this path straight ahead." },
      { speaker: "Mabel", zh: "今天有喂食活动吗？", en: "Is there a feeding session today?" },
      { speaker: "Staff", zh: "有，请查看入口旁的时间表。", en: "Yes. Please check the schedule near the entrance." },
      { speaker: "Mabel", zh: "太棒了，谢谢。", en: "That’s great. Thank you." },
    ],
    expressions: ["Where can we see…? 我们在哪里能看到……？", "Is there a… today? 今天有……吗？"],
  },
  {
    id: 86,
    title: "购买旅行纪念品",
    mission: "询问价格，选一份合适的纪念品。",
    dialogue: [
      { speaker: "Mabel", zh: "请问这个鱼尾狮钥匙扣多少钱？", en: "Excuse me. How much is this Merlion key ring?" },
      { speaker: "Assistant", zh: "十二新加坡元。", en: "It’s twelve Singapore dollars." },
      { speaker: "Mabel", zh: "有其他颜色吗？", en: "Do you have it in another colour?" },
      { speaker: "Assistant", zh: "有蓝色和珊瑚红色。", en: "Yes. We have blue and coral." },
      { speaker: "Mabel", zh: "我要珊瑚红色的，谢谢。", en: "I’ll take the coral one, please." },
    ],
    expressions: ["Do you have it in…? 这个有……的吗？", "I’ll take… 我要……"],
  },
  {
    id: 87,
    title: "分享新加坡旅行亮点",
    mission: "用完整句子讲出最喜欢的景点和原因。",
    dialogue: [
      { speaker: "Mum", zh: "新加坡之旅你最喜欢什么？", en: "What did you like best about Singapore?" },
      { speaker: "Mabel", zh: "我最喜欢滨海湾花园。", en: "I liked Gardens by the Bay best." },
      { speaker: "Mum", zh: "为什么？", en: "Why?" },
      { speaker: "Mabel", zh: "因为云雾林很壮观，而且很凉快。", en: "Because Cloud Forest was amazing and cool inside." },
      { speaker: "Mum", zh: "你的英语也用得很棒！", en: "You used your English really well too!" },
    ],
    expressions: ["What did you like best about…? 你最喜欢……的什么？", "Because… 因为……"],
  },
];

const unitForLesson = (lessonId: number) =>
  units.find((unit) => lessonId >= unit.start && lessonId <= unit.end)?.id ?? 1;

export const lessons: Lesson[] = [
  ...originalLessons.map((lesson) => ({ ...lesson, unitId: unitForLesson(lesson.id) })),
  ...singaporeLessons.map((lesson) => ({ ...lesson, unitId: 13 })),
];

export const getUnit = (unitId: number) => units.find((unit) => unit.id === unitId) ?? units[0];
export const getLesson = (lessonId: number) => lessons.find((lesson) => lesson.id === lessonId) ?? lessons[0];
export const lessonsForUnit = (unitId: number) => lessons.filter((lesson) => lesson.unitId === unitId);

export const speakerZh: Record<string, string> = {
  Mabel: "Mabel",
  Emma: "Emma",
  Mum: "妈妈",
  Dad: "爸爸",
  Teacher: "老师",
  Cashier: "收银员",
  Assistant: "店员",
  Server: "服务员",
  Staff: "工作人员",
  Attendant: "乘务员",
  Doctor: "医生",
  Pharmacist: "药剂师",
  Stranger: "陌生人",
  Officer: "入境官员",
  Passenger: "乘客",
  Driver: "司机",
  Local: "当地人",
  Receptionist: "前台",
};
