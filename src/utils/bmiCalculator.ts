import { BmiCategory, BmiResult } from '../types';

/**
 * Calculates BMI and provides clinical feedback tailored for Thai population (Asian-Pacific WHO guidelines)
 * BMI = weight (kg) / (height (m) ^ 2)
 */
export function calculateBMI(
  weightKg: number,
  heightCm: number,
  standard: 'asian' | 'who' = 'asian'
): BmiResult | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmiRaw = weightKg / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;

  // Ideal weight range calculation (Asian standard: 18.5 - 22.9, WHO: 18.5 - 24.9)
  const minNormalBmi = 18.5;
  const maxNormalBmi = standard === 'asian' ? 22.9 : 24.9;
  const idealWeightMin = Math.round(minNormalBmi * heightM * heightM * 10) / 10;
  const idealWeightMax = Math.round(maxNormalBmi * heightM * heightM * 10) / 10;

  let weightDifference = 0;
  if (weightKg < idealWeightMin) {
    weightDifference = Math.round((weightKg - idealWeightMin) * 10) / 10; // negative: needs to gain
  } else if (weightKg > idealWeightMax) {
    weightDifference = Math.round((weightKg - idealWeightMax) * 10) / 10; // positive: needs to lose
  }

  let category: BmiCategory;
  let categoryLabelTh: string;
  let categoryLabelEn: string;
  let color: string;
  let bgColor: string;
  let borderColor: string;
  let descriptionTh: string;
  let recommendationsTh: string[];
  let dietTipsTh: string[];
  let exerciseTipsTh: string[];

  if (standard === 'asian') {
    // Asian-Pacific Criteria (กรมอนามัย กระทรวงสาธารณสุข & WHO Western Pacific)
    if (bmi < 18.5) {
      category = 'underweight';
      categoryLabelTh = 'ผอม / น้ำหนักน้อยกว่าเกณฑ์';
      categoryLabelEn = 'Underweight';
      color = '#38bdf8'; // Sky blue
      bgColor = 'bg-sky-50 dark:bg-sky-950/30';
      borderColor = 'border-sky-500';
      descriptionTh = 'น้ำหนักน้อยกว่าเกณฑ์ปกติ อาจเสี่ยงต่อภาวะขาดสารอาหาร ภูมิคุ้มกันต่ำ หรือกระดูกพรุน';
      recommendationsTh = [
        'เพิ่มปริมาณพลังงานในแต่ละวัน โดยเน้นอาหารที่มีสารอาหารหนาแน่นและมีประโยชน์',
        'แบ่งรับประทานอาหารเป็น 4-5 มื้อย่อยในแต่ละวัน',
        'ตรวจเช็กร่างกายเพื่อหาสาเหตุของการดูดซึมสารอาหารหรือภาวะไทรอยด์เป็นพิษหากน้ำหนักลดลงต่อเนื่อง'
      ];
      dietTipsTh = [
        'เน้นโปรตีนคุณภาพสูง เช่น อกไก่ ปลา ไข่ เต้าหู้ ถั่วเปลือกแข็ง',
        'เพิ่มไขมันดี เช่น อะโวคาโด น้ำมันมะกอก อัลมอนด์',
        'ดื่มนมหรือสมูทตี้เสริมโปรตีนระหว่างมื้อ'
      ];
      exerciseTipsTh = [
        'เน้นเวทเทรนนิ่ง (Resistance / Weight Training) 3-4 วัน/สัปดาห์ เพื่อเสริมสร้างมวลกล้ามเนื้อ',
        'การวิ่ง VCR 30 นาที สามารถทำได้แบบเบาๆ (Easy Run) สัปดาห์ละ 1-2 ครั้งเพื่อสุขภาพหัวใจ'
      ];
    } else if (bmi <= 22.9) {
      category = 'normal';
      categoryLabelTh = 'ปกติ / สมส่วน (เกณฑ์สุขภาพดี)';
      categoryLabelEn = 'Normal Weight';
      color = '#10b981'; // Emerald
      bgColor = 'bg-emerald-50 dark:bg-emerald-950/30';
      borderColor = 'border-emerald-500';
      descriptionTh = 'ยินดีด้วย! คุณมีดัชนีมวลกายอยู่ในเกณฑ์มาตรฐาน อัตราเสี่ยงต่อโรคหลอดเลือดหัวใจและเบาหวานต่ำสุด';
      recommendationsTh = [
        'รักษาน้ำหนักและวิถีชีวิตสุขภาพนี้ไว้อย่างต่อเนื่อง',
        'ตรวจสุขภาพประจำปีอย่างสม่ำเสมอ',
        'นอนหลับพักผ่อนให้เพียงพอ 7-8 ชั่วโมงต่อวัน'
      ];
      dietTipsTh = [
        'รับประทานอาหารครบ 5 หมู่ในสัดส่วน 2:1:1 (ผัก 2 ส่วน, ข้าวแป้ง 1 ส่วน, โปรตีน 1 ส่วน)',
        'ลดอาหารหวาน มัน เค็ม และเลี่ยงเครื่องดื่มน้ำตาลสูง',
        'ดื่มน้ำเปล่าให้ได้วันละ 2-2.5 ลิตร'
      ];
      exerciseTipsTh = [
        'ออกกำลังกายคาร์ดิโออย่างต่อเนื่อง เช่น วิ่ง VCR 30 นาที 3-5 วันต่อสัปดาห์',
        'ผสมผสานกับการออกกำลังกายสร้างกล้ามเนื้อและยืดเหยียด (Stretching)'
      ];
    } else if (bmi <= 24.9) {
      category = 'overweight';
      categoryLabelTh = 'ท้วม / น้ำหนักเกินเกณฑ์';
      categoryLabelEn = 'Overweight';
      color = '#f59e0b'; // Amber
      bgColor = 'bg-amber-50 dark:bg-amber-950/30';
      borderColor = 'border-amber-500';
      descriptionTh = 'เริ่มมีน้ำหนักเกินเกณฑ์ อาจเริ่มสะสมไขมันในช่องท้อง เสี่ยงต่อความดันโลหิตและไขมันในเลือดสูงขึ้น';
      recommendationsTh = [
        'เริ่มปรับเปลี่ยนพฤติกรรม ควบคุมพลังงานอาหารให้ต่ำกว่าที่ใช้เล็กน้อย (Caloric Deficit 300-500 kcal)',
        'ลดการนั่งติดที่เป็นเวลานาน ขยับร่างกายให้บ่อยขึ้นในระหว่างวัน',
        'ตั้งเป้าหมายลดน้ำหนักอย่างค่อยเป็นค่อยไป 0.5 กก./สัปดาห์'
      ];
      dietTipsTh = [
        'ลดแป้งขัดขาว หันมาทานคาร์โบไฮเดรตเชิงซ้อน เช่น ข้าวกล้อง ข้าวโอ๊ต',
        'งดของทอด ของมัน ขนมหวาน น้ำอัดลม และชานมไข่มุก',
        'เน้นผักใบเขียวและผลไม้รสไม่หวานจัด เช่น ฝรั่ง แอปเปิ้ลเขียว แก้วมังกร'
      ];
      exerciseTipsTh = [
        'ฝึกวิ่ง VCR 30 นาที สัปดาห์ละ 3-4 ครั้ง ช่วยเผาผลาญไขมันและกระตุ้นระบบเผาผลาญ',
        'หากมีอาการเจ็บข้อเข่า ให้สลับกับการเดินเร็ว (Brisk Walk) หรือปั่นจักรยาน'
      ];
    } else if (bmi <= 29.9) {
      category = 'obese1';
      categoryLabelTh = 'อ้วนระดับ 1 (เสี่ยงปานกลาง)';
      categoryLabelEn = 'Obese Class I';
      color = '#f97316'; // Orange
      bgColor = 'bg-orange-50 dark:bg-orange-950/30';
      borderColor = 'border-orange-500';
      descriptionTh = 'ภาวะอ้วนระดับ 1 มีความเสี่ยงสูงต่อโรคเบาหวานชนิดที่ 2 ไขมันพอกตับ ความดันโลหิตสูง และภาวะหยุดหายใจขณะหลับ';
      recommendationsTh = [
        'ควรเริ่มต้นโปรแกรมควบคุมอาหารและออกกำลังกายอย่างจริงจัง',
        'วัดรอบเอวให้อยู่ในเกณฑ์มาตรฐาน (ชาย < 90 ซม., หญิง < 80 ซม.)',
        'ปรึกษาแพทย์หรือนักกำหนดอาหารเพื่อวางแผนการปรับน้ำหนักอย่างปลอดภัย'
      ];
      dietTipsTh = [
        'ควบคุมแคลอรีต่อวันอย่างเคร่งครัด งดของทอดและอาหารแปรรูป (Ultra-processed foods)',
        'เคี้ยวช้าๆ ดื่มน้ำ 1 แก้วก่อนอาหารทุกมื้อ',
        'หลีกเลี่ยงการทานมื้อดึกและเว้นช่วงอดอาหารตอนกลางคืน (Intermittent Fasting 12/12 หรือ 16/8)'
      ];
      exerciseTipsTh = [
        'เริ่มต้นด้วยการเดินเร็วสลับวิ่งเหยาะๆ (Interval Walk/Run) 30 นาที เพื่อถนอมข้อเข่า',
        'เลือกรองเท้าวิ่งที่มีระบบรองรับแรงกระแทก (Cushioning) สูง'
      ];
    } else {
      category = 'obese2';
      categoryLabelTh = 'อ้วนระดับ 2 (อันตราย / เสี่ยงสูงมาก)';
      categoryLabelEn = 'Obese Class II';
      color = '#ef4444'; // Red
      bgColor = 'bg-red-50 dark:bg-red-950/30';
      borderColor = 'border-red-500';
      descriptionTh = 'ภาวะอ้วนระดับอันตราย มีความเสี่ยงต่อโรคหัวใจ หลอดเลือดสมอง และภาวะแทรกซ้อนทางเมตาบอลิกสูงมาก';
      recommendationsTh = [
        'แนะนำให้พบแพทย์เพื่อตรวจเช็กระบบหลอดเลือด หัวใจ และตรวจเลือดโดยละเอียด',
        'ควรอยู่ภายใต้การดูแลของผู้เชี่ยวชาญด้านสุขภาพ',
        'ให้ความสำคัญกับการลดน้ำหนักอย่างต่อเนื่องและปลอดภัย'
      ];
      dietTipsTh = [
        'จำกัดพลังงานและหลีกเลี่ยงน้ำตาล ไขมันทรานส์ แอลกอฮอล์ และโซเดียมสูง',
        'เน้นอาหารธรรมชาติ ปรุงด้วยวิธีต้ม นึ่ง อบ แทนการทอด',
        'จดบันทึกไดอารี่อาหารที่รับประทานทุกวัน'
      ];
      exerciseTipsTh = [
        'เน้นการออกกำลังกายแบบ Low-impact เช่น เดินเร็วในน้ำ ว่ายน้ำ ปั่นจักรยาน ก่อนเริ่มวิ่งเร็ว',
        'สำหรับ VCR 30 นาที ให้ใช้วิธีเดินเร็วตามจังหวะชีพจร หรือเดินสลับพัก'
      ];
    }
  } else {
    // WHO International Standard
    if (bmi < 18.5) {
      category = 'underweight';
      categoryLabelTh = 'ผอม (Underweight)';
      categoryLabelEn = 'Underweight';
      color = '#38bdf8';
      bgColor = 'bg-sky-50 dark:bg-sky-950/30';
      borderColor = 'border-sky-500';
      descriptionTh = 'น้ำหนักต่ำกว่าเกณฑ์สากลขององค์การอนามัยโลก (WHO)';
      recommendationsTh = ['เพิ่มพลังงานอาหาร เสริมสร้างกล้ามเนื้อ'];
      dietTipsTh = ['รับประทานโปรตีนและไขมันดีเพิ่มขึ้น'];
      exerciseTipsTh = ['เน้นเวทเทรนนิ่ง'];
    } else if (bmi <= 24.9) {
      category = 'normal';
      categoryLabelTh = 'ปกติ (Normal Weight)';
      categoryLabelEn = 'Normal';
      color = '#10b981';
      bgColor = 'bg-emerald-50 dark:bg-emerald-950/30';
      borderColor = 'border-emerald-500';
      descriptionTh = 'น้ำหนักอยู่ในเกณฑ์สุขภาพดีตามมาตรฐานสากล';
      recommendationsTh = ['รักษาสมดุลอาหารและออกกำลังกายสม่ำเสมอ'];
      dietTipsTh = ['อาหารครบ 5 หมู่ ลดหวานมันเค็ม'];
      exerciseTipsTh = ['คาร์ดิโอ 150 นาที/สัปดาห์ เช่น วิ่ง 30 นาที'];
    } else if (bmi <= 29.9) {
      category = 'overweight';
      categoryLabelTh = 'น้ำหนักเกิน (Overweight)';
      categoryLabelEn = 'Overweight';
      color = '#f59e0b';
      bgColor = 'bg-amber-50 dark:bg-amber-950/30';
      borderColor = 'border-amber-500';
      descriptionTh = 'น้ำหนักเกินเกณฑ์มาตรฐานสากล ควรควบคุมน้ำหนัก';
      recommendationsTh = ['ควบคุมพลังงานและออกกำลังกายเพื่อลดไขมัน'];
      dietTipsTh = ['ลดแป้งและน้ำตาล'];
      exerciseTipsTh = ['วิ่ง 30 นาที 3-4 วันต่อสัปดาห์'];
    } else {
      category = 'obese1';
      categoryLabelTh = 'โรคอ้วน (Obese)';
      categoryLabelEn = 'Obese';
      color = '#ef4444';
      bgColor = 'bg-red-50 dark:bg-red-950/30';
      borderColor = 'border-red-500';
      descriptionTh = 'ดัชนีมวลกายเข้าข่ายโรคอ้วนตามเกณฑ์สากล';
      recommendationsTh = ['ควรปรึกษาแพทย์และวางแผนลดน้ำหนักอย่างเป็นระบบ'];
      dietTipsTh = ['ควบคุมอาหารอย่างจริงจัง หลีกเลี่ยงอาหารแปรรูป'];
      exerciseTipsTh = ['ออกกำลังกายแบบลดแรงกระแทกก่อน'];
    }
  }

  return {
    bmi,
    category,
    categoryLabelTh,
    categoryLabelEn,
    color,
    bgColor,
    borderColor,
    descriptionTh,
    recommendationsTh,
    dietTipsTh,
    exerciseTipsTh,
    idealWeightMin,
    idealWeightMax,
    weightDifference,
  };
}

/**
 * Calculates BMR and TDEE estimate using Mifflin-St Jeor Formula
 */
export function calculateMetabolicRates(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female',
  activityMultiplier = 1.375 // Lightly active (light exercise 1-3 days/week)
) {
  // Mifflin-St Jeor:
  // Male: 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + 5
  // Female: 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) - 161
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  bmr = Math.max(800, Math.round(bmr));
  const tdee = Math.round(bmr * activityMultiplier);

  return { bmr, tdee };
}
