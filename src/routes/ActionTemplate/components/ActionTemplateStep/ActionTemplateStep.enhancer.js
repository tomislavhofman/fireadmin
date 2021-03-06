import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { formValueSelector } from 'redux-form'
import { withHandlers, setPropTypes } from 'recompose'
import { ACTION_TEMPLATE_FORM_NAME } from 'constants/formNames'
import * as handlers from './ActionTemplateStep.handlers'

const selector = formValueSelector(ACTION_TEMPLATE_FORM_NAME)

export default compose(
  connect((state, props) => selector(state, 'inputs', 'steps')),
  setPropTypes({
    fields: PropTypes.shape({
      map: PropTypes.func.isRequired, // used in component
      push: PropTypes.func.isRequired // used in handlers
    })
  }),
  withHandlers(handlers)
)
