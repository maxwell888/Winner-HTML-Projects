/**
 * math-adventure/data.js
 * 小学数学探险之旅 — 全量知识点数据 + 题库 + 成就配置
 * Phase 1 (MVP): 二年级第1单元「100以内加减法」4 课时
 */

const MATH_DATA = {
  version: "1.0.0-mvp",
  grades: {
    "2": {
      id: "grade-2",
      name: "二年级",
      subtitle: "开启数学探险之旅",
      color: "emerald",
      icon: "fa-seedling",
      mascot: "🐿️",
      mascotName: "小松果",
      bgGradient: "from-emerald-100 via-green-50 to-teal-50",
      units: [
        // ===== 第1单元：100以内加减法 =====
        {
          id: "g2-u1",
          name: "100以内加减法",
          icon: "fa-plus-minus",
          color: "orange",
          order: 1,
          lessons: [
            // --- 课时1：不进位加法 ---
            {
              id: "g2-u1-l1",
              title: "不进位加法",
              subtitle: "把小棒合起来数一数",
              difficulty: 1,
              sceneType: "sticks-addition",
              sceneConfig: {
                num1: 23, num2: 15,
                hasCarry: false,
                story: "小松果采了 23 个松果,又采了 15 个,一共有多少个?",
                steps: [
                  {
                    narration: "先把单根的小棒合起来:3 根 + 5 根 = 8 根",
                    highlight: "ones",
                    resultText: "3 + 5 = 8"
                  },
                  {
                    narration: "再把整捆的小棒合起来:2 捆 + 1 捆 = 3 捆",
                    highlight: "tens",
                    resultText: "20 + 10 = 30"
                  },
                  {
                    narration: "一共是 3 捆 8 根,所以 23 + 15 = 38!",
                    highlight: "result",
                    resultText: "23 + 15 = 38",
                    celebration: true
                  }
                ]
              },
              exercises: [
                { id:"e1", type:"choice", question:"21 + 17 = ?", options:["38","48","28","37"], answer:0, hint:"先加个位: 1+7=?", explanation:"个位 1+7=8,十位 2+1=3,结果是 38" },
                { id:"e2", type:"choice", question:"34 + 23 = ?", options:["47","57","67","53"], answer:1, hint:"个位 4+3=?,十位 3+2=?", explanation:"个位 4+3=7,十位 3+2=5,结果是 57" },
                { id:"e3", type:"choice", question:"45 + 12 = ?", options:["57","67","53","47"], answer:0, hint:"先算个位再算十位", explanation:"个位 5+2=7,十位 4+1=5,结果是 57" },
                { id:"e4", type:"fill", question:"52 + 36 = ?", answer:"88", hint:"个位: 2+6=8,十位: 5+3=8", explanation:"个位 2+6=8,十位 5+3=8,结果是 88" },
                { id:"e5", type:"choice", question:"63 + 25 = ?", options:["88","78","98","85"], answer:0, hint:"63=60+3,25=20+5", explanation:"个位 3+5=8,十位 6+2=8,结果是 88" }
              ]
            },

            // --- 课时2：进位加法 ---
            {
              id: "g2-u1-l2",
              title: "进位加法",
              subtitle: "个位满了十根,捆成一捆",
              difficulty: 2,
              sceneType: "sticks-addition",
              sceneConfig: {
                num1: 27, num2: 16,
                hasCarry: true,
                story: "小松果早采 27 个,晚采 16 个,今天一共采了多少?",
                steps: [
                  {
                    narration: "先把单根的小棒合起来:7 根 + 6 根 = 13 根。哇,超过 10 根了!",
                    highlight: "ones",
                    resultText: "7 + 6 = 13"
                  },
                  {
                    narration: "把 10 根单棒捆成 1 捆,这就是「进位」!个位剩 3 根,向十位进 1",
                    highlight: "carry",
                    resultText: "满十进一，个位写 3"
                  },
                  {
                    narration: "现在十位有:原来的 2 捆 + 1 捆 + 进上来的 1 捆 = 4 捆,个位 3 根",
                    highlight: "tens",
                    resultText: "2 + 1 + 1 = 4"
                  },
                  {
                    narration: "所以 27 + 16 = 43! 进位加法关键:满十进一,记得把进位的 1 加到十位上哦!",
                    highlight: "result",
                    resultText: "27 + 16 = 43",
                    celebration: true
                  }
                ]
              },
              exercises: [
                { id:"e6", type:"choice", question:"28 + 15 = ?", options:["43","33","53","47"], answer:0, hint:"个位 8+5=13,满十进一", explanation:"个位 8+5=13,进1留3;十位 2+1+1=4,结果是 43" },
                { id:"e7", type:"choice", question:"36 + 27 = ?", options:["53","63","73","57"], answer:1, hint:"个位 6+7=13,向十位进 1", explanation:"个位 6+7=13,进1留3;十位 3+2+1=6,结果是 63" },
                { id:"e8", type:"choice", question:"49 + 18 = ?", options:["57","67","77","59"], answer:1, hint:"个位 9+8=17,进 1", explanation:"个位 9+8=17,进1留7;十位 4+1+1=6,结果是 67" },
                { id:"e9", type:"fill", question:"54 + 29 = ?", answer:"83", hint:"个位 4+9=13,向十位进 1", explanation:"个位 4+9=13,进1留3;十位 5+2+1=8,结果是 83" },
                { id:"e10", type:"choice", question:"68 + 25 = ?", options:["93","83","103","87"], answer:0, hint:"个位 8+5=13,满十进一", explanation:"个位 8+5=13,进1留3;十位 6+2+1=9,结果是 93" }
              ]
            },

            // --- 课时3：不退位减法 ---
            {
              id: "g2-u1-l3",
              title: "不退位减法",
              subtitle: "从小棒里拿走一部分",
              difficulty: 1,
              sceneType: "sticks-subtraction",
              sceneConfig: {
                num1: 38, num2: 15,
                hasBorrow: false,
                story: "小松果有 38 个松果,吃掉了 15 个,还剩多少个?",
                steps: [
                  {
                    narration: "先拿走单根的小棒:8 根 − 5 根 = 3 根",
                    highlight: "ones",
                    resultText: "8 - 5 = 3"
                  },
                  {
                    narration: "再拿走整捆的小棒:3 捆 − 1 捆 = 2 捆",
                    highlight: "tens",
                    resultText: "30 - 10 = 20"
                  },
                  {
                    narration: "还剩 2 捆 3 根,所以 38 − 15 = 23!",
                    highlight: "result",
                    resultText: "38 - 15 = 23",
                    celebration: true
                  }
                ]
              },
              exercises: [
                { id:"e11", type:"choice", question:"47 − 23 = ?", options:["24","14","34","26"], answer:0, hint:"先减个位: 7−3=4", explanation:"个位 7−3=4,十位 4−2=2,结果是 24" },
                { id:"e12", type:"choice", question:"56 − 14 = ?", options:["32","42","52","46"], answer:1, hint:"个位 6−4=2,十位 5−1=4", explanation:"个位 6−4=2,十位 5−1=4,结果是 42" },
                { id:"e13", type:"fill", question:"69 − 35 = ?", answer:"34", hint:"先算个位,再算十位", explanation:"个位 9−5=4,十位 6−3=3,结果是 34" },
                { id:"e14", type:"choice", question:"85 − 42 = ?", options:["43","33","53","47"], answer:0, hint:"个位 5−2=3,十位 8−4=4", explanation:"个位 5−2=3,十位 8−4=4,结果是 43" },
                { id:"e15", type:"choice", question:"78 − 26 = ?", options:["42","52","62","48"], answer:1, hint:"78−20=58, 58−6=52", explanation:"个位 8−6=2,十位 7−2=5,结果是 52" }
              ]
            },

            // --- 课时4：退位减法 ---
            {
              id: "g2-u1-l4",
              title: "退位减法",
              subtitle: "不够减?拆一捆来帮忙!",
              difficulty: 2,
              sceneType: "sticks-subtraction",
              sceneConfig: {
                num1: 43, num2: 16,
                hasBorrow: true,
                story: "小松果有 43 个松果,送朋友 16 个,还剩多少个?",
                steps: [
                  {
                    narration: "先看个位:3 根不够减 6 根,怎么办?",
                    highlight: "ones",
                    resultText: "3 < 6，不够减！"
                  },
                  {
                    narration: "从十位借 1 捆(10根)拆开!现在个位有 10+3=13 根,够减了。这叫「退位」",
                    highlight: "borrow",
                    resultText: "十位退1，个位加10 → 13"
                  },
                  {
                    narration: "个位:13 根 − 6 根 = 7 根。十位:还剩 3 捆 − 1 捆 = 2 捆",
                    highlight: "tens",
                    resultText: "13−6=7, 3−1=2"
                  },
                  {
                    narration: "还剩 2 捆 7 根,所以 43 − 16 = 27! 退位减法秘诀:不够减,向十位借1当10!",
                    highlight: "result",
                    resultText: "43 − 16 = 27",
                    celebration: true
                  }
                ]
              },
              exercises: [
                { id:"e16", type:"choice", question:"52 − 18 = ?", options:["34","44","24","36"], answer:0, hint:"个位 2−8 不够减,向十位借 1", explanation:"个位 2−8 不够,十位借1→12−8=4;十位 5−1−1=3,结果是 34" },
                { id:"e17", type:"choice", question:"71 − 35 = ?", options:["46","36","26","44"], answer:1, hint:"个位 1−5 不够减", explanation:"个位借1→11−5=6;十位 7−1−3=3,结果是 36" },
                { id:"e18", type:"choice", question:"90 − 27 = ?", options:["73","63","53","67"], answer:1, hint:"个位 0−7 不够减", explanation:"个位借1→10−7=3;十位 9−1−2=6,结果是 63" },
                { id:"e19", type:"fill", question:"64 − 38 = ?", answer:"26", hint:"个位 4−8 不够,向十位借 1", explanation:"个位借1→14−8=6;十位 6−1−3=2,结果是 26" },
                { id:"e20", type:"choice", question:"83 − 49 = ?", options:["44","34","24","36"], answer:1, hint:"个位 3−9 不够,借位", explanation:"个位借1→13−9=4;十位 8−1−4=3,结果是 34" }
              ]
            }
          ]
        },

        // ===== 第2单元：认识长度单位 =====
        {
          id: "g2-u2",
          name: "认识长度单位",
          icon: "fa-ruler",
          color: "blue",
          order: 2,
          locked: false,
          lessons: [
            {
              id: "g2-u2-l1", title: "认识厘米", subtitle: "用尺子量一量", difficulty: 1,
              sceneType: "ruler-measure",
              sceneConfig: {
                story: "小松果想知道自己的铅笔有多长,我们来帮它量一量!",
                objects: [{ name:"铅笔", length:8, color:"#F59E0B" },{ name:"橡皮", length:3, color:"#EC4899" },{ name:"蜡笔", length:6, color:"#8B5CF6" }],
                steps: [
                  { narration:"量物体时,要把尺子的「0刻度」对准物体的一端", highlight:"zero", resultText:"0刻度 = 起点" },
                  { narration:"看物体另一端对着刻度几,就是几厘米。比如铅笔对着8,就是8厘米", highlight:"measure", resultText:"铅笔长 8 厘米" },
                  { narration:"厘米用字母「cm」表示。8厘米写作 8cm。你学会了吗?", highlight:"unit", resultText:"厘米 = cm", celebration:true }
                ]
              },
              exercises: [
                { id:"e21", type:"choice", question:"铅笔长 8 厘米,写作用哪个单位?", options:["8cm","8m","8mm","8km"], answer:0, hint:"厘米的英文是 centimeter", explanation:"厘米用 cm 表示,所以是 8cm" },
                { id:"e22", type:"choice", question:"橡皮大约有多长?", options:["3厘米","10厘米","20厘米","30厘米"], answer:0, hint:"想想你用的橡皮", explanation:"普通橡皮大约 3 厘米长" },
                { id:"e23", type:"fill", question:"一把尺子长 15 厘米,也就是 __ cm", answer:"15", hint:"数字不变,单位换缩写", explanation:"15 厘米 = 15cm" },
                { id:"e24", type:"choice", question:"量物体长度时,尺子的哪里要对准物体一端?", options:["0刻度","1刻度","尺子中间","尺子末端"], answer:0, hint:"从起点开始量", explanation:"量长度要从 0 刻度开始" },
                { id:"e25", type:"choice", question:"下面哪个最适合用厘米来量?", options:["铅笔长度","马路长度","房子高度","城市距离"], answer:0, hint:"厘米是较小的长度单位", explanation:"铅笔长度适合用厘米,马路和城市距离太大了" }
              ]
            },
            {
              id: "g2-u2-l2", title: "认识米", subtitle: "1米有多长?", difficulty: 1,
              sceneType: "ruler-measure",
              sceneConfig: {
                story: "厘米太小了,量教室要用更大的单位——「米」!",
                objects: [{ name:"课桌", length:1, color:"#3B82F6", unit:"m" },{ name:"门", length:2, color:"#10B981", unit:"m" }],
                steps: [
                  { narration:"量比较长的物体,用「米」做单位。1米 = 100厘米", highlight:"relation", resultText:"1米 = 100厘米" },
                  { narration:"米的字母是「m」。1米 = 1m。你的两臂张开大约就是1米!", highlight:"body", resultText:"张开双臂 ≈ 1m" },
                  { narration:"课桌高约 1 米,门高约 2 米。你还能想到什么是用米来量的?", highlight:"examples", resultText:"1米=100cm=1m", celebration:true }
                ]
              },
              exercises: [
                { id:"e26", type:"choice", question:"1米 = ? 厘米", options:["10","100","1000","50"], answer:1, hint:"米比厘米大很多", explanation:"1米 = 100厘米" },
                { id:"e27", type:"choice", question:"教室的门高约多少?", options:["2厘米","2米","20米","20厘米"], answer:1, hint:"门比人高一点", explanation:"门高约 2 米" },
                { id:"e28", type:"fill", question:"2米 = __ 厘米", answer:"200", hint:"1米=100厘米,2米就是2个100", explanation:"2 × 100 = 200 厘米" },
                { id:"e29", type:"choice", question:"下面哪个用「米」做单位最合适?", options:["橡皮长度","教室长度","指甲宽度","铅笔长度"], answer:1, hint:"选最大的那个", explanation:"教室长度适合用米,其他的都太小了" },
                { id:"e30", type:"choice", question:"300厘米 = ? 米", options:["3","30","300","0.3"], answer:0, hint:"100厘米=1米", explanation:"300÷100=3,所以是 3 米" }
              ]
            }
          ]
        },

        // ===== 第3单元：角的初步认识 =====
        {
          id: "g2-u3",
          name: "角的初步认识",
          icon: "fa-draw-polygon",
          color: "purple",
          order: 3,
          locked: false,
          lessons: [
            {
              id: "g2-u3-l1", title: "认识角", subtitle: "角长什么样?", difficulty: 1,
              sceneType: "angle-explorer",
              sceneConfig: {
                story: "小松果在生活里发现了好多「角」——桌子角、书本角、三角尺的角!",
                angles: [{ type:"standard", deg:45, label:"锐角" }],
                steps: [
                  { narration:"角有一个「顶点」和两条「边」。顶点就是两条边相交的那个点", highlight:"parts", resultText:"角 = 1个顶点 + 2条边" },
                  { narration:"角的大小看两条边张开的程度,张开越大,角越大。和边的长短没关系哦!", highlight:"size", resultText:"角的大小 = 边张开的大小" },
                  { narration:"画角的方法:先画顶点,再从顶点出发画两条边。你也来试试吧!", highlight:"draw", resultText:"顶点 → 画两条边", celebration:true }
                ]
              },
              exercises: [
                { id:"e31", type:"choice", question:"一个角有几个顶点?", options:["1个","2个","3个","0个"], answer:0, hint:"两条边相交的那个点", explanation:"角有且只有 1 个顶点" },
                { id:"e32", type:"choice", question:"一个角有几条边?", options:["1条","2条","3条","4条"], answer:1, hint:"从顶点出发的线", explanation:"角有 2 条边" },
                { id:"e33", type:"choice", question:"角的大小和什么有关?", options:["边的长短","边张开的大小","顶点的位置","边的颜色"], answer:1, hint:"不是边的长度哦", explanation:"角的大小由两条边张开的程度决定" },
                { id:"e34", type:"fill", question:"一个角有 __ 个顶点和 __ 条边", answer:"1,2", hint:"顶点+两条边", explanation:"角有 1 个顶点和 2 条边" },
                { id:"e35", type:"choice", question:"下面哪个图形不是角?", options:["三角尺的尖","打开的书本","圆圆的球","剪刀的交叉"], answer:2, hint:"球没有尖尖的顶点", explanation:"球没有顶点和边,所以不是角" }
              ]
            },
            {
              id: "g2-u3-l2", title: "直角、锐角和钝角", subtitle: "三角尺是判断角的好帮手", difficulty: 2,
              sceneType: "angle-explorer",
              sceneConfig: {
                story: "角也有不同类型!用三角尺上的直角来比一比吧。",
                angles: [{ type:"right", deg:90, label:"直角" },{ type:"acute", deg:45, label:"锐角" },{ type:"obtuse", deg:135, label:"钝角" }],
                steps: [
                  { narration:"三角尺上最大的那个角就是「直角」。直角 = 90 度,方方正正!", highlight:"right", resultText:"直角 = 90°" },
                  { narration:"比直角小的角叫「锐角」。锐角尖尖的,像针一样", highlight:"acute", resultText:"锐角 < 直角" },
                  { narration:"比直角大的角叫「钝角」。钝角张得很开", highlight:"obtuse", resultText:"钝角 > 直角" },
                  { narration:"巧记:锐<直<钝! 用三角尺的直角去比,就能判断是什么角啦!", highlight:"compare", resultText:"锐角 < 直角 < 钝角", celebration:true }
                ]
              },
              exercises: [
                { id:"e36", type:"choice", question:"直角是多少度?", options:["45°","90°","180°","60°"], answer:1, hint:"方方正正的角", explanation:"直角 = 90°" },
                { id:"e37", type:"choice", question:"比直角小的角叫什么?", options:["钝角","直角","锐角","大角"], answer:2, hint:"尖尖的、像针一样", explanation:"比直角小的角叫锐角" },
                { id:"e38", type:"choice", question:"比直角大的角叫什么?", options:["锐角","直角","钝角","小角"], answer:2, hint:"张得很开的角", explanation:"比直角大的角叫钝角" },
                { id:"e39", type:"choice", question:"三角尺上最大的角是什么角?", options:["锐角","钝角","直角","尖角"], answer:2, hint:"用三角尺比一比", explanation:"三角尺上最大的角是直角(90°)" },
                { id:"e40", type:"choice", question:"120°的角是什么角?", options:["锐角","直角","钝角","尖角"], answer:2, hint:"120 比 90 大", explanation:"120°>90°,所以是钝角" }
              ]
            }
          ]
        },

        // ===== 第4单元：乘法的初步认识 =====
        {
          id: "g2-u4",
          name: "乘法的初步认识",
          icon: "fa-xmark",
          color: "pink",
          order: 4,
          locked: false,
          lessons: [
            {
              id: "g2-u4-l1", title: "乘法的意义", subtitle: "相同加数加很多次,用乘法!", difficulty: 1,
              sceneType: "multiplication-array",
              sceneConfig: {
                story: "小松果把苹果摆成整齐的队伍:每排 3 个,摆了 4 排,一共有多少个?",
                rows: 4, cols: 3, item: "🍎",
                steps: [
                  { narration:"加法:3+3+3+3=12。4个3相加,写起来好长啊!", highlight:"addition", resultText:"3+3+3+3 = 12" },
                  { narration:"用乘法就简单多了! 4个3 写作 4×3,读作「4乘3」", highlight:"multiplication", resultText:"4 × 3 = 12" },
                  { narration:"乘法就是「相同加数」的简便运算。× 叫「乘号」", highlight:"symbol", resultText:"× = 乘号", celebration:true }
                ]
              },
              exercises: [
                { id:"e41", type:"choice", question:"3+3+3+3 用乘法表示是?", options:["4×3","3×3","3+4","4+3"], answer:0, hint:"4个3相加", explanation:"4个3相加 = 4×3 = 12" },
                { id:"e42", type:"choice", question:"5×2 表示什么意思?", options:["5+2","2+2+2+2+2","5+5","5−2"], answer:1, hint:"5个2相加", explanation:"5×2 = 2+2+2+2+2,5个2相加" },
                { id:"e43", type:"fill", question:"2+2+2+2+2+2 = 6 × __", answer:"2", hint:"6个2相加", explanation:"6个2相加 = 6×2" },
                { id:"e44", type:"choice", question:"乘号是什么符号?", options:["+","−","×","÷"], answer:2, hint:"像叉叉一样的", explanation:"乘号是 ×" },
                { id:"e45", type:"choice", question:"4×3 等于多少?", options:["7","12","1","43"], answer:1, hint:"3+3+3+3", explanation:"4×3=3+3+3+3=12" }
              ]
            },
            {
              id: "g2-u4-l2", title: "2和3的乘法口诀", subtitle: "背口诀,算得快!", difficulty: 1,
              sceneType: "multiplication-array",
              sceneConfig: {
                story: "乘法口诀是快速计算的法宝!先学2和3的口诀。",
                rows: 3, cols: 2, item: "⭐",
                steps: [
                  { narration:"2的乘法口诀:一二得二,二二得四。每多1个2,积就多2", highlight:"2table", resultText:"1×2=2, 2×2=4" },
                  { narration:"3的乘法口诀:一三得三,二三得六,三三得九。每多1个3,积就多3", highlight:"3table", resultText:"1×3=3, 2×3=6, 3×3=9" },
                  { narration:"背口诀有规律:几的口诀,积就每次加几。你发现了吗?", highlight:"pattern", resultText:"规律:每次加相同的数", celebration:true }
                ]
              },
              exercises: [
                { id:"e46", type:"choice", question:"二二得?", options:["二","四","六","八"], answer:1, hint:"2×2=?", explanation:"二二得四,2×2=4" },
                { id:"e47", type:"choice", question:"三三得?", options:["三","六","九","十二"], answer:2, hint:"3×3=?", explanation:"三三得九,3×3=9" },
                { id:"e48", type:"fill", question:"2 × 3 = __", answer:"6", hint:"二三得六", explanation:"2×3=6,口诀:二三得六" },
                { id:"e49", type:"choice", question:"3 × 2 = ?", options:["5","6","9","8"], answer:1, hint:"2×3 和 3×2 一样", explanation:"3×2=6,和2×3答案相同" },
                { id:"e50", type:"fill", question:"3 × 3 = __", answer:"9", hint:"三三得?", explanation:"三三得九,3×3=9" }
              ]
            }
          ]
        },

        // ===== 第5单元：表内乘法(2-6口诀) =====
        {
          id: "g2-u5",
          name: "表内乘法(2-6口诀)",
          icon: "fa-table",
          color: "indigo",
          order: 5,
          locked: false,
          lessons: [
            {
              id: "g2-u5-l1", title: "4的乘法口诀", subtitle: "每次加4", difficulty: 2,
              sceneType: "multiplication-array",
              sceneConfig: {
                story: "今天学4的口诀!每多1个4,积就多4。", rows: 4, cols: 4, item: "🌸",
                steps: [
                  { narration:"一四得四,二四得八,三四十二,四四十六。你发现规律了吗?", highlight:"table", resultText:"每次 +4" },
                  { narration:"巧记:4的口诀的积都是双数!因为两个双数相加还是双数", highlight:"hint", resultText:"结果都是双数" },
                  { narration:"多读几遍就记住啦!一四得四,二四得八,三四十二,四四十六!", highlight:"recite", resultText:"4的口诀背起来!", celebration:true }
                ]
              },
              exercises: [
                { id:"e51", type:"choice", question:"三四得?", options:["七","十二","十六","八"], answer:1, hint:"3×4=?", explanation:"三四十二,3×4=12" },
                { id:"e52", type:"choice", question:"四四得?", options:["八","十二","十六","二十"], answer:2, hint:"4×4=?", explanation:"四四十六,4×4=16" },
                { id:"e53", type:"fill", question:"4 × 2 = __", answer:"8", hint:"二四得八", explanation:"二四得八,4×2=8" },
                { id:"e54", type:"choice", question:"4 × 3 = ?", options:["7","12","9","16"], answer:1, hint:"三四十二", explanation:"4×3=12" },
                { id:"e55", type:"fill", question:"4 × 5 = __", answer:"20", hint:"四五得?", explanation:"四五二十,4×5=20" }
              ]
            },
            {
              id: "g2-u5-l2", title: "5的乘法口诀", subtitle: "积的个位是0或5", difficulty: 2,
              sceneType: "multiplication-array",
              sceneConfig: {
                story: "5的口诀最简单!积的个位不是0就是5。", rows: 5, cols: 5, item: "🖐️",
                steps: [
                  { narration:"一五得五,二五一十,三五十五,四五二十,五五二十五", highlight:"table", resultText:"每次 +5" },
                  { narration:"巧记:5的口诀积的个位交替出现 5,0,5,0,5!永不例外!", highlight:"pattern", resultText:"个位:5→0→5→0→5" },
                  { narration:"用手指数5的口诀:1只手5根手指,2只手10根...", highlight:"fingers", resultText:"数手指也能算!", celebration:true }
                ]
              },
              exercises: [
                { id:"e56", type:"choice", question:"三五得?", options:["八","十五","二十","十"], answer:1, hint:"3×5=?", explanation:"三五十五,3×5=15" },
                { id:"e57", type:"choice", question:"五五得?", options:["十","二十","二十五","三十"], answer:2, hint:"5×5=?", explanation:"五五二十五,5×5=25" },
                { id:"e58", type:"fill", question:"5 × 4 = __", answer:"20", hint:"四五二十", explanation:"5×4=20" },
                { id:"e59", type:"choice", question:"5 × 6 = ?", options:["25","30","35","11"], answer:1, hint:"五六三十", explanation:"5×6=30" },
                { id:"e60", type:"choice", question:"5的口诀积的个位有什么规律?", options:["全是5","全是0","0和5交替","没有规律"], answer:2, hint:"看看一五得五,二五一十...", explanation:"个位5→0→5→0→5交替" }
              ]
            },
            {
              id: "g2-u5-l3", title: "6的乘法口诀", subtitle: "挑战最后一行", difficulty: 2,
              sceneType: "multiplication-array",
              sceneConfig: {
                story: "6的口诀稍微难一点,但你一定可以!准备好了吗?", rows: 6, cols: 6, item: "🐝",
                steps: [
                  { narration:"一六得六,二六十二,三六十八,四六二十四,五六三十,六六三十六", highlight:"table", resultText:"每次 +6" },
                  { narration:"巧记6口诀:前半(1-3)和后半(4-6)对称!看:1×6=6,6×6=36→尾数都是6", highlight:"symmetry", resultText:"头尾对称巧记" },
                  { narration:"六六三十六,五八四十...诶不对!背口诀要专心,别串词哦~", highlight:"fun", resultText:"2-6口诀全掌握!", celebration:true }
                ]
              },
              exercises: [
                { id:"e61", type:"choice", question:"三六得?", options:["十二","十八","二十四","九"], answer:1, hint:"3×6=?", explanation:"三六十八,3×6=18" },
                { id:"e62", type:"choice", question:"六六得?", options:["三十","三十二","三十六","四十二"], answer:2, hint:"6×6=?", explanation:"六六三十六,6×6=36" },
                { id:"e63", type:"fill", question:"6 × 4 = __", answer:"24", hint:"四六二十四", explanation:"6×4=24" },
                { id:"e64", type:"choice", question:"6 × 5 = ?", options:["25","30","35","40"], answer:1, hint:"五六三十", explanation:"6×5=30" },
                { id:"e65", type:"fill", question:"6 × 2 = __", answer:"12", hint:"二六十二", explanation:"6×2=12,二六十二" }
              ]
            }
          ]
        },

        // ===== 第6单元：认识时间 =====
        {
          id: "g2-u6",
          name: "认识时间",
          icon: "fa-clock",
          color: "teal",
          order: 6,
          locked: false,
          lessons: [
            {
              id: "g2-u6-l1", title: "认识整时", subtitle: "时针指几就是几点", difficulty: 1,
              sceneType: "clock-reader",
              sceneConfig: {
                story: "小松果要按时上学!先来认识整点时间吧。",
                times: [{ hour:8, minute:0, label:"8:00 上学" },{ hour:12, minute:0, label:"12:00 午饭" },{ hour:4, minute:0, label:"4:00 放学" }],
                steps: [
                  { narration:"钟面上有 12 个数字。短的是「时针」,长的是「分针」", highlight:"parts", resultText:"短=时针, 长=分针" },
                  { narration:"整点时:分针指向12,时针指向几就是几点。图上时针指向8,就是8点!", highlight:"8oclock", resultText:"8:00 = 八点整" },
                  { narration:"8:00 写作「8时」,也写作「8:00」。你每天的起床时间是几点?", highlight:"write", resultText:"认识整时,很简单!", celebration:true }
                ]
              },
              exercises: [
                { id:"e66", type:"choice", question:"钟面上短针叫什么?", options:["时针","分针","秒针","长针"], answer:0, hint:"短=时", explanation:"短的叫时针,长的叫分针" },
                { id:"e67", type:"choice", question:"整点时,分针指向几?", options:["6","12","3","9"], answer:1, hint:"分针指在最上面", explanation:"整点时,分针指向 12" },
                { id:"e68", type:"choice", question:"分针指12,时针指9,是几点?", options:["12点","9点","3点","6点"], answer:1, hint:"时针指向几就是几点", explanation:"时针指9,分针指12,是9点" },
                { id:"e69", type:"fill", question:"钟面上有 __ 个数字", answer:"12", hint:"从1数到12", explanation:"钟面上有 12 个数字" },
                { id:"e70", type:"choice", question:"1小时 = ? 分钟", options:["10","30","60","100"], answer:2, hint:"钟面走一圈是60小格", explanation:"1小时 = 60分钟" }
              ]
            },
            {
              id: "g2-u6-l2", title: "认识几时几分", subtitle: "分针走一小格是1分钟", difficulty: 2,
              sceneType: "clock-reader",
              sceneConfig: {
                story: "除了整点,我们还需要知道具体几分。分针走1小格=1分钟!",
                times: [{ hour:3, minute:15, label:"3:15" },{ hour:7, minute:30, label:"7:30" },{ hour:10, minute:45, label:"10:45" }],
                steps: [
                  { narration:"分针走1小格是1分钟,走1大格(5小格)是5分钟。数分针时:从12开始,用5的口诀数!", highlight:"minute-basics", resultText:"1大格 = 5分钟" },
                  { narration:"看这个:时针在3和4之间→是3点多;分针指向3→三五十五→3:15!", highlight:"315", resultText:"3:15 = 三点十五分" },
                  { narration:"分针指向6→五六三十→半点! 所以7:30也叫「七点半」", highlight:"730", resultText:"7:30 = 七点半" },
                  { narration:"注意:时针在几和几之间,就是几时多!现在是10和11之间→10点多,分针指向9→五九四十五→10:45!", highlight:"1045", resultText:"用口诀读数,快!", celebration:true }
                ]
              },
              exercises: [
                { id:"e71", type:"choice", question:"分针走1大格是几分钟?", options:["1分钟","5分钟","10分钟","60分钟"], answer:1, hint:"1大格=5小格", explanation:"分针走1大格(5小格)=5分钟" },
                { id:"e72", type:"choice", question:"分针指向6,是多少分钟?", options:["6分钟","15分钟","30分钟","60分钟"], answer:2, hint:"五六三十", explanation:"分针指6→5×6=30分钟" },
                { id:"e73", type:"choice", question:"时针在2和3之间,分针指向6,是几点?", options:["2:06","2:30","3:30","6:02"], answer:1, hint:"在2和3之间就是2点多", explanation:"时针在2-3之间=2点多,分针指6=30分→2:30" },
                { id:"e74", type:"fill", question:"分针指向9,是 __ 分钟", answer:"45", hint:"五九四十五", explanation:"5×9=45分钟" },
                { id:"e75", type:"choice", question:"时针在8和9之间,分针指向3,是几点?", options:["8:03","8:15","9:15","3:08"], answer:1, hint:"8点多+三五十五=30分", explanation:"8点多,分针指3=15分→8:15" }
              ]
            }
          ]
        },

        // ===== 第7单元：表内除法 =====
        {
          id: "g2-u7",
          name: "表内除法",
          icon: "fa-divide",
          color: "red",
          order: 7,
          locked: false,
          lessons: [
            {
              id: "g2-u7-l1", title: "平均分", subtitle: "每份分得一样多", difficulty: 1,
              sceneType: "division-sharing",
              sceneConfig: {
                story: "小松果有12个松果,想平均分给3个朋友,每人分几个?",
                total: 12, groups: 3, item: "🥜",
                steps: [
                  { narration:"「平均分」就是每份分得一样多。总共12个,分成3份", highlight:"total", resultText:"总数 = 12" },
                  { narration:"一个接一个轮流分:你一个,你一个,你一个...直到分完", highlight:"distribute", resultText:"每人分到 4 个" },
                  { narration:"12平均分成3份,每份4个。这就是除法:12 ÷ 3 = 4", highlight:"result", resultText:"12 ÷ 3 = 4", celebration:true }
                ]
              },
              exercises: [
                { id:"e76", type:"choice", question:"「平均分」是什么意思?", options:["随便分","每份一样多","分给一个人","分很多次"], answer:1, hint:"平均=公平", explanation:"平均分就是每份分得一样多" },
                { id:"e77", type:"choice", question:"8个苹果平均分给2人,每人几个?", options:["2","4","6","8"], answer:1, hint:"8分成2份", explanation:"8÷2=4,每人4个" },
                { id:"e78", type:"fill", question:"10 ÷ 2 = __", answer:"5", hint:"10平均分成2份", explanation:"10个平均分2份,每份5个" },
                { id:"e79", type:"choice", question:"15个糖平均分给5个小朋友,每人几个?", options:["2","3","5","10"], answer:1, hint:"15÷5=?", explanation:"15÷5=3,每人3个" },
                { id:"e80", type:"choice", question:"6个蛋糕平均分给3人,算式是?", options:["6+3","6−3","6×3","6÷3"], answer:3, hint:"平均分用除法", explanation:"6个平均分3份,用除法:6÷3=2" }
              ]
            },
            {
              id: "g2-u7-l2", title: "用口诀求商", subtitle: "乘法口诀反过来用!", difficulty: 2,
              sceneType: "division-sharing",
              sceneConfig: {
                story: "学会了乘法口诀,除法就简单了!因为乘法和除法是相反的。",
                total: 18, groups: 6, item: "🍬",
                steps: [
                  { narration:"18÷6=? 想:6×?=18。背6的乘法口诀...三六十八!", highlight:"think", resultText:"6 × 3 = 18" },
                  { narration:"所以 18÷6=3! 用乘法口诀反过来算除法,这叫「口诀求商」", highlight:"reverse", resultText:"18 ÷ 6 = 3" },
                  { narration:"试试:24÷4=? 想4的口诀:四六二十四!所以24÷4=6", highlight:"practice", resultText:"乘法口诀是除法好帮手!", celebration:true }
                ]
              },
              exercises: [
                { id:"e81", type:"choice", question:"12÷3=? 想 3×?=12", options:["3","4","5","6"], answer:1, hint:"三四十二", explanation:"3×4=12,所以12÷3=4" },
                { id:"e82", type:"choice", question:"20÷5=?", options:["3","4","5","6"], answer:1, hint:"四五二十", explanation:"5×4=20,所以20÷5=4" },
                { id:"e83", type:"fill", question:"36 ÷ 6 = __", answer:"6", hint:"六六三十六", explanation:"6×6=36,所以36÷6=6" },
                { id:"e84", type:"choice", question:"24÷4=?", options:["4","5","6","8"], answer:2, hint:"四六二十四", explanation:"4×6=24,所以24÷4=6" },
                { id:"e85", type:"fill", question:"30 ÷ 5 = __", answer:"6", hint:"五六三十", explanation:"5×6=30,所以30÷5=6" }
              ]
            }
          ]
        },

        // ===== 第8单元：数据收集整理 =====
        {
          id: "g2-u8",
          name: "数据收集整理",
          icon: "fa-chart-bar",
          color: "cyan",
          order: 8,
          locked: false,
          lessons: [
            {
              id: "g2-u8-l1", title: "简单统计", subtitle: "数一数,画一画", difficulty: 1,
              sceneType: "bar-chart",
              sceneConfig: {
                story: "班里要选最喜欢的运动!小松果来帮忙统计投票结果。",
                data: [
                  { label:"跑步", value:8, color:"#EF4444" },
                  { label:"跳绳", value:12, color:"#3B82F6" },
                  { label:"游泳", value:6, color:"#10B981" },
                  { label:"篮球", value:10, color:"#F59E0B" }
                ],
                steps: [
                  { narration:"收集数据:问每个同学喜欢什么运动,用「正」字记录,一笔代表1票", highlight:"collect", resultText:"用「正」字计数" },
                  { narration:"画条形图:横轴是运动项目,竖轴是票数。柱子越高,票数越多!", highlight:"chart", resultText:"条形图一目了然" },
                  { narration:"看!跳绳最高(12票),游泳最低(6票)。喜欢跳绳的人最多!数据会说故事", highlight:"analyze", resultText:"跳绳最受欢迎!", celebration:true }
                ]
              },
              exercises: [
                { id:"e86", type:"choice", question:"用「正」字计数时,一个「正」代表几票?", options:["3","5","10","1"], answer:1, hint:"正字有几笔", explanation:"一个「正」字有5笔,代表5票" },
                { id:"e87", type:"choice", question:"条形图中,柱子越高表示什么?", options:["越矮","数量越少","数量越多","没有意义"], answer:2, hint:"高=多", explanation:"条形图柱子越高,表示数量越多" },
                { id:"e88", type:"choice", question:"跳绳12票,游泳6票。喜欢跳绳的比游泳多几人?", options:["3","6","12","18"], answer:1, hint:"12−6=?", explanation:"12−6=6,多6人" },
                { id:"e89", type:"fill", question:"跑步8票+篮球10票=一共 __ 票", answer:"18", hint:"8+10=?", explanation:"8+10=18票" },
                { id:"e90", type:"choice", question:"哪种方式最适合统计一个班的投票?", options:["死记硬背","画条形图","乱写","猜"], answer:1, hint:"数据可视化", explanation:"画条形图可以清晰地展示数据" }
              ]
            }
          ]
        }
      ]
    },

    // ===== 三到六年级占位 =====
    "3": {
      id: "grade-3",
      name: "三年级",
      subtitle: "探索更广阔的数学世界",
      color: "blue",
      icon: "fa-tree",
      mascot: "🐰",
      mascotName: "小跳跳",
      bgGradient: "from-blue-100 via-sky-50 to-indigo-50",
      units: [
        // ===== 第1单元：时、分、秒 =====
        {
          id: "g3-u1",
          name: "时、分、秒",
          icon: "fa-clock",
          color: "blue",
          order: 1,
          locked: false,
          lessons: [
            { id:"g3-u1-l1", title:"秒的认识", subtitle:"1秒很短，很快", difficulty:1, sceneType:"clock-reader",
              sceneConfig:{ story:"运动会跑步比赛，谁跑得更快？看秒表！", times:[],
                steps:[{narration:"1秒很短，眨一下眼就过去了",highlight:"zero",resultText:"1秒 ≈ 眨眼一次"},{narration:"钟面上最细最长的针是「秒针」",highlight:"ones",resultText:"秒针走1小格=1秒"},{narration:"1分钟=60秒，1小时=60分钟",highlight:"carry",resultText:"1分=60秒，1小时=60分"},{narration:"时间短用秒，时间长用分或小时",highlight:"tens",resultText:"短时间：秒；长时间：分/小时"}],celebration:true},
              exercises:[{id:"e1",type:"choice",question:"眨一下眼大约多长？",options:["1秒","1分钟","1小时","10分钟"],answer:0,hint:"一秒钟很短哦",explanation:"眨一下眼大约1秒"},{id:"e2",type:"choice",question:"1分钟等于多少秒？",options:["10秒","30秒","60秒","100秒"],answer:2,hint:"分和秒的换算",explanation:"1分钟=60秒"},{id:"e3",type:"fill",question:"唱一首儿歌大约用1____？",answer:"分钟",hint:"几秒不够，一小时太长",explanation:"唱一首儿歌大约用1分钟"},{id:"e4",type:"choice",question:"体育课跑50米用什么单位？",options:["秒","分","小时","天"],answer:0,hint:"跑步比赛用秒计时",explanation:"50米跑用秒计时"},{id:"e5",type:"choice",question:"刷牙大约多长时间？",options:["3秒","3分钟","30分钟","3小时"],answer:1,hint:"几秒太短了，30分钟太长了",explanation:"刷牙大约用3分钟"}]},
            { id:"g3-u1-l2",title:"时间计算",subtitle:"算一算经过多长时间",difficulty:2, sceneType:"clock-reader",
              sceneConfig:{ story:"早上7:30出门，8:15到学校，路上用了多久？", times:[],
                steps:[{narration:"结束时间-开始时间=经过时间",highlight:"zero",resultText:"结束-开始=经过"},{narration:"8:15-7:30=45分钟",highlight:"ones",resultText:"8:15-7:30=45分"},{narration:"分钟不够减怎么办？从小时借1小时=60分钟",highlight:"carry",resultText:"借位：1小时=60分钟"},{narration:"注意借位后再减，答案就对了！",highlight:"tens",resultText:"8:15-7:30=45分钟",celebration:true}],celebration:true},
              exercises:[{id:"e6",type:"choice",question:"上课8:00，下课8:40，上了多长时间？",options:["20分钟","30分钟","40分钟","50分钟"],answer:2,hint:"8:40-8:00=40分钟",explanation:"40分钟"},{id:"e7",type:"choice",question:"7:10到7:40过了多久？",options:["10分钟","20分钟","30分钟","40分钟"],answer:2,hint:"7:40-7:10=30分",explanation:"30分钟"},{id:"e8",type:"choice",question:"电影10:00开始11:30结束，演了多长时间？",options:["1小时","1小时30分","2小时","2小时30分"],answer:1,hint:"11:30-10:00=1小时30分",explanation:"1小时30分"},{id:"e9",type:"fill",question:"6:30起床，7:00出门，准备了____分钟？",answer:"30",hint:"7:00-6:30=30分",explanation:"30分钟"},{id:"e10",type:"choice",question:"2:40开始看书，3:10结束，看了多长时间？",options:["20分钟","30分钟","40分钟","50分钟"],answer:1,hint:"3:10-2:40=30分钟",explanation:"30分钟"}]}
          ]
        },

        // ===== 第2单元：多位数乘一位数 =====
        { id:"g3-u2", name:"多位数乘一位数", icon:"fa-xmark", color:"indigo", order:2, locked:false,
          lessons:[
            { id:"g3-u2-l1", title:"整十整百数乘一位数", subtitle:"20×3=60", difficulty:1, sceneType:"multiplication-array",
              sceneConfig:{ story:"每盒铅笔有20支，3盒有多少支？", steps:[{narration:"20×3就是3个20相加：20+20+20=60",highlight:"addition",resultText:"20+20+20=60"},{narration:"先算2×3=6，再补一个0：20×3=60",highlight:"multiplication",resultText:"2×3=6→20×3=60"},{narration:"整十数乘一位数：先把0藏起来算，算完再加0！",highlight:"symbol",resultText:"藏0算→算完→补0",celebration:true}],celebration:true},
              exercises:[{id:"e11",type:"choice",question:"20×3=?",options:["40","50","60","70"],answer:2,hint:"2×3=6补一个0",explanation:"20×3=60"},{id:"e12",type:"choice",question:"300×2=?",options:["500","600","700","800"],answer:1,hint:"3×2=6补两个0",explanation:"300×2=600"},{id:"e13",type:"fill",question:"40×5=____",answer:"200",hint:"4×5=20补一个0",explanation:"40×5=200"},{id:"e14",type:"choice",question:"500×4=?",options:["1000","2000","2000","2000"],answer:1,hint:"5×4=20补两个0",explanation:"500×4=2000"},{id:"e15",type:"fill",question:"70×6=____",answer:"420",hint:"7×6=42补一个0",explanation:"70×6=420"}]},
            { id:"g3-u2-l2",title:"两位数乘一位数（不进位）", subtitle:"12×3=36", difficulty:2, sceneType:"multiplication-array",
              sceneConfig:{ story:"每排12个星星，有3排，一共有多少？", steps:[{narration:"12拆成10和2：10×3=30，2×3=6",highlight:"addition",resultText:"10×3=30，2×3=6"},{narration:"30+6=36",highlight:"multiplication",resultText:"30+6=36"},{narration:"竖式也可以算，从个位开始乘",highlight:"symbol",resultText:"12×3=36",celebration:true}],celebration:true},
              exercises:[{id:"e16",type:"choice",question:"12×3=?",options:["32","33","34","36"],answer:3,hint:"10×3+2×3",explanation:"30+6=36"},{id:"e17",type:"choice",question:"21×4=?",options:["82","83","84","85"],answer:2,hint:"20×4=80，1×4=4，80+4=84",explanation:"21×4=84"},{id:"e18",type:"choice",question:"43×2=?",options:["84","85","86","87"],answer:0,hint:"40×2=80，3×2=6，80+6=86",explanation:"43×2=86"},{id:"e19",type:"choice",question:"32×3=?",options:["94","95","96","97"],answer:2,hint:"30×3=90，2×3=6，90+6=96",explanation:"32×3=96"},{id:"e20",type:"fill",question:"24×2=____",answer:"48",hint:"20×2=40，4×2=8，40+8=48",explanation:"24×2=48"}]},
            { id:"g3-u2-l3",title:"两位数乘一位数（进位）", subtitle:"18×3=54", difficulty:2, sceneType:"multiplication-array",
              sceneConfig:{ story:"每篮有18个鸡蛋，3篮有多少？小心进位哦！", steps:[{narration:"8×3=24，个位写4，向十位进2",highlight:"addition",resultText:"8×3=24，进位2"},{narration:"10×3=30，加上进位2是32，十位写3，百位写5",highlight:"multiplication",resultText:"30+2=32"},{narration:"所以18×3=54！注意进位不要忘！",highlight:"symbol",resultText:"18×3=54",celebration:true}],celebration:true},
              exercises:[{id:"e21",type:"choice",question:"18×3=?",options:["44","54","64","74"],answer:1,hint:"8×3=24，进位2；10×3=30+2=32",explanation:"18×3=54"},{id:"e22",type:"choice",question:"26×2=?",options:["42","52","62","72"],answer:1,hint:"6×2=12，进位1；20×2=40+1=41+1=52",explanation:"26×2=52"},{id:"e23",type:"fill",question:"19×3=____",answer:"57",hint:"9×3=27，进位2；10×3=30+2=32",explanation:"19×3=57"},{id:"e24",type:"choice",question:"37×2=?",options:["74","75","76","77"],answer:0,hint:"7×2=14，进位1；30×2=60+1=61+1=74",explanation:"37×2=74"},{id:"e25",type:"choice",question:"16×4=?",options:["64","65","66","67"],answer:0,hint:"6×4=24，进位2；10×4=40+2=42+2=64",explanation:"16×4=64"}]}]},

        // ===== 第3单元：长方形和正方形周长 =====
        { id:"g3-u3", name:"长方形和正方形周长", icon:"fa-border-all", color:"green", order:3, locked:false,
          lessons:[
            { id:"g3-u3-l1", title:"周长的认识", subtitle:"绕图形一圈的长度", difficulty:1, sceneType:"multiplication-array",
              sceneConfig:{ story:"给照片围一圈花边，要多长的花边？", steps:[{narration:"周长就是绕图形一周的总长度",highlight:"addition",resultText:"周长=一周长度"},{narration:"长方形有2条长边（长）和2条短边（宽）",highlight:"multiplication",resultText:"长方形:2×(长+宽)"},{narration:"正方形四条边都相等，周长=4×边长",highlight:"symbol",resultText:"正方形周长=4×边长",celebration:true}],celebration:true},
              exercises:[{id:"e26",type:"choice",question:"长方形的周长=？",options:["长+宽","2×(长+宽)","4×长","长×宽"],answer:1,hint:"2条长2条宽",explanation:"长方形周长=2×(长+宽)"},{id:"e27",type:"choice",question:"正方形边长5厘米，周长是多少？",options:["10厘米","15厘米","20厘米","25厘米"],answer:2,hint:"4×边长",explanation:"4×5=20厘米"},{id:"e28",type:"fill",question:"长方形长8米，宽2米，周长是____米？",answer:"20",hint:"2×(8+2)=2×10=20",explanation:"2×(8+2)=20米"},{id:"e29",type:"choice",question:"正方形桌子边长10分米，周长是？",options:["20分米","30分米","40分米","50分米"],answer:2,hint:"4×10=40",explanation:"4×10=40分米"},{id:"e30",type:"choice",question:"长方形长6米，宽4米，周长是？",options:["10米","15米","20米","25米"],answer:2,hint:"2×(6+4)=2×10=20",explanation:"20米"}]},
            { id:"g3-u3-l2",title:"长方形周长计算", subtitle:"(长+宽)×2", difficulty:2, sceneType:"multiplication-array",
              sceneConfig:{ story:"篮球场是长方形，长28米，宽15米，周长多少？", steps:[{narration:"先算长加宽：28+15=43米",highlight:"addition",resultText:"28+15=43"},{narration:"再乘2：43×2=86米",highlight:"multiplication",resultText:"43×2=86"},{narration:"(长+宽)×2，就是周长！",highlight:"symbol",resultText:"(长+宽)×2",celebration:true}],celebration:true},
              exercises:[{id:"e31",type:"choice",question:"长10厘米，宽5厘米，周长是？",options:["20厘米","30厘米","40厘米","50厘米"],answer:1,hint:"2×(10+5)=30",explanation:"30厘米"},{id:"e32",type:"fill",question:"长8米，宽3米，周长是____米？",answer:"22",hint:"2×(8+3)=2×11=22",explanation:"22米"},{id:"e33",type:"choice",question:"正方形花坛边长6米，周长是？",options:["24米","25米","26米","27米"],answer:0,hint:"4×6=24",explanation:"24米"},{id:"e34",type:"choice",question:"长12米，宽8米，周长是？",options:["30米","40米","50米","60米"],answer:1,hint:"2×(12+8)=2×20=40",explanation:"40米"},{id:"e35",type:"fill",question:"正方形手帕边长20厘米，周长是____厘米？",answer:"80",hint:"4×20=80",explanation:"80厘米"}]}]},

        // ===== 第4单元：分数的初步认识 =====
        { id:"g3-u4", name:"分数的初步认识", icon:"fa-pie-chart", color:"orange", order:4, locked:false,
          lessons:[
            { id:"g3-u4-l1",title:"几分之一",subtitle:"1/2、1/4…",difficulty:1,sceneType:"division-sharing",
              sceneConfig:{ story:"把1个月饼分给2个朋友，每人分一半", steps:[{narration:"一半就是1/2，读作「二分之一」",highlight:"zero",resultText:"一半=1/2"},{narration:"分母表示分成几份，分子表示取几份",highlight:"ones",resultText:"分子在上，分母在下"},{narration:"1/3就是分成3份取1份，1/4分成4份取1份",highlight:"carry",resultText:"1/3、1/4、1/5…"},{narration:"分的份数越多，每一份越小！",highlight:"tens",resultText:"分越细，每一份越小",celebration:true}],celebration:true},
              exercises:[{id:"e36",type:"choice",question:"把1块蛋糕分成2份，每份是？",options:["1/2","1/3","1/4","2/1"],answer:0,hint:"一半是二分之一",explanation:"1/2"},{id:"e37",type:"choice",question:"1/4读作？",options:["四分之一","一分之四","四分之四","一分之四"],answer:0,hint:"先读分母，再读分子",explanation:"四分之一"},{id:"e38",type:"fill",question:"把1个西瓜分成6份，每份是1/____？",answer:"6",hint:"分成几份，分母就是几",explanation:"1/6"},{id:"e39",type:"choice",question:"1/3和1/4哪个大？",options:["1/3大","1/4大","一样大","不确定"],answer:0,hint:"分的份数越少，每一份越大",explanation:"1/3大"},{id:"e40",type:"fill",question:"把1个圆分成8份，每份是1/____",answer:"8",hint:"分成8份，分母8",explanation:"1/8"}]},
            { id:"g3-u4-l2",title:"几分之几",subtitle:"2/4、3/8…",difficulty:2,sceneType:"division-sharing",
              sceneConfig:{ story:"把1个披萨分成8块，吃了3块，吃了多少？", steps:[{narration:"吃了3块，就是3/8，读作「八分之三」",highlight:"addition",resultText:"3/8"},{narration:"分母是8（分成8块），分子是3（吃了3块）",highlight:"ones",resultText:"3/8"},{narration:"分子=取的份数，分母=分成的总份数",highlight:"multiplication",resultText:"几分之几=取几份/分成几份"},{narration:"比较分数：分母相同比分子，分子大的分数大",highlight:"symbol",resultText:"分母相同：分子大的分数大",celebration:true}],celebration:true},
              exercises:[{id:"e41",type:"choice",question:"2/5读作？",options:["五分之二","二分之五","五分之五","二分之二"],answer:0,hint:"先读分母后读分子",explanation:"五分之二"},{id:"e42",type:"fill",question:"把1个圆分成4份，取3份是____分之3？",answer:"四",hint:"分成4份，分母4",explanation:"四分之三"},{id:"e43",type:"choice",question:"3/7和2/7哪个大？",options:["3/7","2/7","一样大","不确定"],answer:0,hint:"分母相同，分子大的分数大",explanation:"3/7比2/7大"},{id:"e44",type:"fill",question:"1个圆分成10份，取7份是____分之7？",answer:"十",hint:"分成10份，分母10",explanation:"十分之七"},{id:"e45",type:"choice",question:"1/2和1/3哪个大？",options:["1/2大","1/3大","一样大","不确定"],answer:0,hint:"分母小，每一份大",explanation:"1/2大"}]}]},

        // ===== 第5单元：面积 =====
        { id:"g3-u5", name:"面积", icon:"fa-square", color:"purple", order:5, locked:false,
          lessons:[
            { id:"g3-u5-l1", title:"面积和面积单位", subtitle:"平方厘米、平方分米、平方米", difficulty:1, sceneType:"multiplication-array",
              sceneConfig:{ story:"桌子和黑板谁大？物体表面的大小叫「面积」", steps:[{narration:"边长1厘米的正方形，面积是1平方厘米（小指甲盖）",highlight:"addition",resultText:"1平方厘米"},{narration:"边长1分米的正方形，面积是1平方分米（手掌心）",highlight:"ones",resultText:"1平方分米"},{narration:"边长1米的正方形，面积是1平方米（地上画个大正方形）",highlight:"multiplication",resultText:"1平方米"},{narration:"选合适的单位：指甲用平方厘米，桌子平方分米，房间平方米",highlight:"symbol",resultText:"合适的单位要大小适中",celebration:true}],celebration:true},
              exercises:[{id:"e46",type:"choice",question:"指甲盖的面积大约是？",options:["1平方厘米","1平方分米","1平方米","1公里"],answer:0,hint:"小指甲盖是平方厘米",explanation:"1平方厘米"},{id:"e47",type:"choice",question:"课桌面的面积大约是？",options:["40平方厘米","40平方分米","40平方米","40公里"],answer:1,hint:"课桌用平方分米",explanation:"40平方分米"},{id:"e48",type:"fill",question:"教室地面的面积用____作单位？",answer:"平方米",hint:"房间用平方米",explanation:"平方米"},{id:"e49",type:"choice",question:"橡皮的面积大约是？",options:["6平方厘米","6平方分米","6平方米","6公里"],answer:0,hint:"橡皮用平方厘米",explanation:"6平方厘米"},{id:"e50",type:"choice",question:"数学书封面的面积大约是？",options:["5平方厘米","5平方分米","5平方米","5公里"],answer:1,hint:"数学书用平方分米",explanation:"5平方分米"}]},
            { id:"g3-u5-l2", title:"长方形和正方形面积计算", subtitle:"长×宽，边长×边长", difficulty:2, sceneType:"multiplication-array",
              sceneConfig:{ story:"长5厘米、宽3厘米的长方形，能摆多少个1平方厘米的小方块？", steps:[{narration:"一行摆5个，摆3行，共摆5×3=15个",highlight:"addition",resultText:"5×3=15"},{narration:"长方形面积=长×宽！",highlight:"multiplication",resultText:"长方形面积=长×宽"},{narration:"正方形面积=边长×边长",highlight:"symbol",resultText:"正方形面积=边长×边长",celebration:true}],celebration:true},
              exercises:[{id:"e51",type:"choice",question:"长方形长6厘米，宽4厘米，面积？",options:["20平方厘米","24平方厘米","28平方厘米","32平方厘米"],answer:1,hint:"6×4=24",explanation:"6×4=24平方厘米"},{id:"e52",type:"fill",question:"正方形边长5分米，面积是____平方分米？",answer:"25",hint:"5×5=25",explanation:"25平方分米"},{id:"e53",type:"choice",question:"长方形长8米，宽5米，面积是？",options:["30平方米","40平方米","50平方米","60平方米"],answer:1,hint:"8×5=40",explanation:"40平方米"},{id:"e54",type:"choice",question:"正方形边长7厘米，面积是？",options:["42平方厘米","49平方厘米","56平方厘米","63平方厘米"],answer:1,hint:"7×7=49",explanation:"49平方厘米"},{id:"e55",type:"fill",question:"长方形长9米，宽6米，面积是____平方米？",answer:"54",hint:"9×6=54",explanation:"54平方米"}]}]},

        // ===== 第6单元：小数的初步认识 =====
        { id:"g3-u6", name:"小数的初步认识", icon:"fa-ellipsis-h", color:"pink", order:6, locked:false,
          lessons:[
            { id:"g3-u6-l1", title:"认识小数", subtitle:"0.1、0.5、1.3…", difficulty:1, sceneType:"division-sharing",
              sceneConfig:{ story:"把1米平均分成10份，1份是1分米=0.1米", steps:[{narration:"1米=10分米，1分米=1/10米=0.1米",highlight:"addition",resultText:"1分米=0.1米"},{narration:"5分米=5/10米=0.5米，读作「零点五米」",highlight:"ones",resultText:"5分米=0.5米"},{narration:"1米1分米=1.1米，整数部分1，小数部分1",highlight:"multiplication",resultText:"1.1米"},{narration:"小数点左边是整数部分，右边是小数部分！",highlight:"symbol",resultText:"整数.小数",celebration:true}],celebration:true},
              exercises:[{id:"e56",type:"choice",question:"0.3读作？",options:["零点三","零三","点三","三点零"],answer:0,hint:"先读整数，再读小数",explanation:"零点三"},{id:"e57",type:"choice",question:"3分米是多少米？",options:["0.3米","3.0米","0.03米","3.3米"],answer:0,hint:"3分米=0.3米",explanation:"0.3米"},{id:"e58",type:"fill",question:"1米6分米是____米？",answer:"1.6",hint:"1米+6分米=1米+0.6米=1.6米",explanation:"1.6米"},{id:"e59",type:"choice",question:"0.8读作？",options:["零点八","零八点","点八","八点零"],answer:0,hint:"零点八",explanation:"零点八"},{id:"e60",type:"choice",question:"9分米是多少米？",options:["0.9米","9.0米","0.09米","9.9米"],answer:0,hint:"9分米=0.9米",explanation:"0.9米"}]},
            { id:"g3-u6-l2", title:"小数比较大小", subtitle:"0.5<0.8，1.2>0.9", difficulty:2, sceneType:"division-sharing",
              sceneConfig:{ story:"0.6元是6角，0.8元是8角，哪个更贵？", steps:[{narration:"6角和8角，当然8角贵，所以0.6<0.8",highlight:"addition",resultText:"0.6<0.8"},{narration:"先看整数部分，大的就大",highlight:"multiplication",resultText:"先看整数部分"},{narration:"整数部分相同，再看小数部分第一位",highlight:"symbol",resultText:"整数相同，再比小数第一位",celebration:true}],celebration:true},
              exercises:[{id:"e61",type:"choice",question:"0.4和0.7哪个大？",options:["0.4大","0.7大","一样大","不确定"],answer:1,hint:"4角和7角比，7角大",explanation:"0.7大"},{id:"e62",type:"choice",question:"1.2和0.9哪个大？",options:["1.2大","0.9大","一样大","不确定"],answer:0,hint:"1元>0元多，1.2>0.9",explanation:"1.2大"},{id:"e63",type:"fill",question:"0.5和0.5比较：0.5____0.5",answer:"=",hint:"一样大",explanation:"0.5=0.5"},{id:"e64",type:"choice",question:"2.3和1.9哪个大？",options:["2.3大","1.9大","一样大","不确定"],answer:0,hint:"2元>1元多",explanation:"2.3大"},{id:"e65",type:"fill",question:"0.9____0.8",answer:">",hint:"9角>8角",explanation:"0.9>0.8"}]}]}]
    },
    "4": {
      id: "grade-4",
      name: "四年级",
      subtitle: "成为数学小能手",
      color: "purple",
      icon: "fa-leaf",
      mascot: "🦊",
      mascotName: "小聪聪",
      bgGradient: "from-purple-100 via-violet-50 to-pink-50",
      units: [
        { id:"g4-u1", name:"大数的认识", icon:"fa-sort-numeric-up", color:"purple", order:1, locked:true, lessons:[] },
        { id:"g4-u2", name:"角的度量", icon:"fa-draw-polygon", color:"orange", order:2, locked:true, lessons:[] },
        { id:"g4-u3", name:"三位数乘两位数", icon:"fa-xmark", color:"blue", order:3, locked:true, lessons:[] },
        { id:"g4-u4", name:"平行四边形和梯形", icon:"fa-shapes", color:"green", order:4, locked:true, lessons:[] }
      ]
    },
    "5": {
      id: "grade-5",
      name: "五年级",
      subtitle: "挑战更高难度",
      color: "red",
      icon: "fa-fire",
      mascot: "🦉",
      mascotName: "小博士",
      bgGradient: "from-red-100 via-orange-50 to-amber-50",
      units: [
        { id:"g5-u1", name:"小数乘除法", icon:"fa-ellipsis-h", color:"red", order:1, locked:true, lessons:[] },
        { id:"g5-u2", name:"简易方程", icon:"fa-equals", color:"blue", order:2, locked:true, lessons:[] },
        { id:"g5-u3", name:"多边形面积", icon:"fa-draw-polygon", color:"green", order:3, locked:true, lessons:[] }
      ]
    },
    "6": {
      id: "grade-6",
      name: "六年级",
      subtitle: "小学毕业冲刺",
      color: "slate",
      icon: "fa-graduation-cap",
      mascot: "🐉",
      mascotName: "小龙",
      bgGradient: "from-slate-100 via-gray-50 to-zinc-50",
      units: [
        { id:"g6-u1", name:"分数乘除法", icon:"fa-pie-chart", color:"slate", order:1, locked:true, lessons:[] },
        { id:"g6-u2", name:"比和比例", icon:"fa-balance-scale", color:"blue", order:2, locked:true, lessons:[] },
        { id:"g6-u3", name:"圆", icon:"fa-circle", color:"purple", order:3, locked:true, lessons:[] }
      ]
    }
  },

  // 成就系统
  achievements: [
    { id:"first-lesson", name:"初次探险", desc:"完成第一个课时", icon:"fa-flag-checkered", color:"emerald" },
    { id:"unit-complete", name:"单元通关", desc:"完成一个单元的所有课时", icon:"fa-trophy", color:"amber" },
    { id:"perfect-score", name:"满分达人", desc:"一个课时练习全部答对", icon:"fa-star", color:"yellow" },
    { id:"streak-3", name:"三天坚持", desc:"连续3天学习", icon:"fa-calendar-check", color:"blue" },
    { id:"streak-7", name:"七天达人", desc:"连续7天学习", icon:"fa-fire", color:"red" }
  ]
};

// 默认进度模板
const DEFAULT_PROGRESS = {
  version: "1.0.0",
  nickname: "",
  grade: 2,
  stars: 0,
  coins: 0,
  streak: 0,
  lastStudyDate: null,
  lessons: {},
  achievements: [],
  settings: { soundEnabled: true, dailyGoal: 2 }
};

// localStorage key
const STORAGE_KEY = "math_adventure_progress";
