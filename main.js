const { createWorker } = require("tesseract.js");
const main = async () => {
  new Promise(async (resolve, reject) => {
    const worker = await createWorker({});
    resolve(worker);
  }).then(async (worker) => {
    await worker.loadLanguage("eng+hin");
    await worker.initialize("eng+hin");
    const {
      data: { text },
    } = await worker.recognize(
      "https://t37287655.p.clickup-attachments.com/t37287655/6c372923-644a-4667-a2e6-da87be5f894c/image.png"
      //   "https://www.immihelp.com/nri/images/sample-pan-card-front.jpg",
      //   "http://www.jagranjosh.com/imported/images/E/Articles/PAN-Uses-Benefits3.jpg",
      //"http://www.jagranjosh.com/imported/images/E/Articles/PAN-Uses-Benefits1.jpg"
    );
    console.log(text);
    if (
      /income/gi.test(text) &&
      /department/gi.test(text) &&
      /tax/gi.test(text) &&
      /govt\./gi.test(text) &&
      /india/gi.test(text) &&
      /permanent/gi.test(text) &&
      /account/gi.test(text) &&
      /number/gi.test(text) &&
      /आयकर विभाग/.test(text) &&
      /भारत सरकार/.test(text)
    ) {
      console.log("PAN CARD CONFIRMED");
      const dataArr = text.split("\n").map((ele) => ele.trim());
      let nameIndex;
      let fatherNameIndex;
      let dobIndex;
      let panIndex;
      //   console.log(dataArr);
      for (let i = 0; i < dataArr.length; i++) {
        if (
          dataArr[i].toLowerCase().includes("permanent") &&
          dataArr[i].toLowerCase().includes("account") &&
          dataArr[i].toLowerCase().includes("number")
        ) {
          panIndex = i + 2;
          break;
        }
      }
      const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
      let pan;
      const filteredPANArray = dataArr[panIndex].match(panRegex);
      filteredPANArray.length > 0 && (pan = filteredPANArray[0]);
      if (pan) {
        for (let i = 0; i < dataArr.length; i++) {
          if (
            dataArr[i].toLowerCase().includes("income") &&
            dataArr[i].toLowerCase().includes("tax") &&
            dataArr[i].toLowerCase().includes("department")
          ) {
            nameIndex = i + 1;
            fatherNameIndex = i + 2;
            dobIndex = i + 3;
            break;
          }
        }
        if (nameIndex && fatherNameIndex && dobIndex) {
          let nameRegExp = /[^A-Za-z]/g;
          let personName = refineText(nameRegExp, dataArr[nameIndex]);
          let fatherName = refineText(nameRegExp, dataArr[fatherNameIndex]);
          let dob = dataArr[dobIndex].split(" ")[0];
          const finalPayload = {
            idType: "panCard",
            idNumber: pan,
            info: {
              name: personName,
              fatherName: fatherName,
              dob: dob,
            },
          };
          console.log(finalPayload);
        } else {
          console.log(
            "Please reupload the document for additional details such as persons name, father name and date of birth"
          );
        }
      } else {
        console.log("The Pan Number is not valid");
      }
    }

    await worker.terminate();
  });
};

const refineText = (regExp, text) => {
  let refinedArray = [];
  for (let word of text.split(" ")) {
    const refinedWord = word.replace(regExp, "");
    refinedWord && refinedArray.push(refinedWord);
  }
  return refinedArray.join(" ");
};

main();
