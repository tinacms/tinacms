import { Component, Prop, h } from '@stencil/core'
import { format } from '../../utils/utils'

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true,
})
export class MyComponent {
  /**
   * The first name
   */
  @Prop() first: string

  /**
   * The middle name
   */
  @Prop() middle: string

  /**
   * The last name
   */
  @Prop() last: string

  @Prop() toot: () => void

  private getText(): string {
    return format(this.first, this.middle, this.last)
  }

  render() {
    return (
      <div class="my-test-css" onClick={this.toot}>
        Hello, World! I'm {this.getText()}
      </div>
    )
  }
}
