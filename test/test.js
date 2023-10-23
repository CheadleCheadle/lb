const { exec } = require("child_process");
const path = require("path");
const expect = require("chai");
const assert = require("assert");

describe("Load balancer", () => {
  it("Run the URL script and make all 32 requests", (done) => {
    // Change working directory to root of project
    const root_dir = path.join(__dirname, "..");
    process.chdir(root_dir);

    const curlCommand =
      "curl --parallel --parallel-immediate --parallel-max 3 --config urls.txt";

    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
          console.log('Error exectuing curl command');
        return done(error);
      }
      const result = stdout.split(" ").length - 1;
      assert.strictEqual(result, 64);
      done();
    });
  });
});
