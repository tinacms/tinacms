import { EM, STRONG, EM_UNDERSCORE, CODE, S } from "./inputRules"

describe("InputRules", () => {
  describe("patterns", () => {
    describe("s", () => {
      describe("valid pattersn", () => {
        const isValid = validatorFor(S)

        isValid("~~test~~")
        // isValid("*test test*")
        // isValid("*te\\*st*", "*te\\*st*")
        // isValid("test*one*test", "t*one*")
      })
      // describe("invalid patterns", () => {
      //   const isInvalid = validatorFor(EM, false)

      //   isInvalid("test")
      //   isInvalid("* test*")
      //   isInvalid("*test *")
      //   isInvalid("* test *")
      //   isInvalid("**test*")
      // })
    })
    describe("em", () => {
      describe("valid pattersn", () => {
        const isValid = validatorFor(EM)

        isValid("*test*")
        isValid("*test test*")
        isValid("*te\\*st*", "*te\\*st*")
        isValid("test*one*test", "t*one*")
      })
      describe("invalid patterns", () => {
        const isInvalid = validatorFor(EM, false)

        isInvalid("test")
        isInvalid("* test*")
        isInvalid("*test *")
        isInvalid("* test *")
        isInvalid("**test*")
      })
    })
    describe("em underscore", () => {
      describe("valid pattersn", () => {
        const isValid = validatorFor(EM_UNDERSCORE)

        isValid("_test_")
        isValid("_test test_")
        isValid("_te\\_st_", "_te\\_st_")
        isValid("test_one_test", "t_one_")
      })
      describe("invalid patterns", () => {
        const isInvalid = validatorFor(EM, false)

        isInvalid("test")
        isInvalid("_ test_")
        isInvalid("_test _")
        isInvalid("_ test _")
        isInvalid("__test_", "_test_")
      })
    })
    describe("code", () => {
      describe("valid pattersn", () => {
        const isValid = validatorFor(CODE)

        isValid("`test`")
        isValid("`test test`")
        isValid("`te\\`st`", "`te\\`st`")
        isValid("test`one`test", "t`one`")
      })
      describe("invalid patterns", () => {
        const isInvalid = validatorFor(EM, false)

        isInvalid("test")
        isInvalid("` test`")
        isInvalid("`test `")
        isInvalid("` test `")
        isInvalid("``test`", "`test`")
      })
    })
    describe("strong", () => {
      describe("valid patterns", () => {
        const isValid = validatorFor(STRONG)

        isValid("**test**")
        isValid("**t**")
        isValid("**one two**")
        isValid("***test***", "**test**")
        isValid("***test**", "**test**")
        isValid("**test***", "**test**")
      })

      describe("invalid patterns", () => {
        const isInvalid = validatorFor(STRONG, false)

        isInvalid("")
        isInvalid("*test*")
        isInvalid("** one two**")
        isInvalid("**one two **")
        isInvalid("** one two **")
      })
    })
  })
})

function validatorFor(regexp: RegExp, validity: boolean = true) {
  return (str: string, match?: string) =>
    it(str, () => {
      let isMatch = regexp.test(str)
      expect(isMatch).toBe(validity)
      if (match && isMatch) {
        let result = regexp.exec(str)!
        console.log(str, result)
        expect(result[0]).toBe(match)
      }
    })
}
