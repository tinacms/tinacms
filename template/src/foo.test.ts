import { foo } from "./foo";

describe("two", () => {
  it("is two", () => {
    expect(foo()).toBe("bar");
  });
});
