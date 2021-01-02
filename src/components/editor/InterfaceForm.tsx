import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { YUP_MSG } from '../../family/UIConst'
import { Formik, Field, Form } from 'formik'
import { TextField } from 'formik-material-ui'
import * as Yup from 'yup'
import {
  Button,
  Theme,
  Dialog,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { SlideUp } from 'components/common/Transition'
import { Interface, Repository, RootState, Module } from '../../actions/types'
import { updateInterface, addInterface } from '../../actions/interface'
import { StoreStateRouterLocationURI, push } from 'family'
export const METHODS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'OPTIONS',
  'PATCH',
  'HEAD'
]
export const STATUS_LIST = [200, 301, 403, 404, 500, 502, 503, 504]
export const INTERFACE_TYPE = ['HTTP', 'SOCKET', 'OTHER']
export const KNOWN_INTERFACE_TYPE = ['HTTP', 'SOCKET']

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {},
  appBar: {
    position: 'relative'
  },
  title: {
    marginLeft: spacing(2),
    flex: 1
  },
  preview: {
    marginTop: spacing(1)
  },
  form: {
    minWidth: 500,
    minHeight: 300
  },
  formTitle: {
    color: 'rgba(0, 0, 0, 0.54)',
    fontSize: 9
  },
  formItem: {
    marginBottom: spacing(1)
  },
  ctl: {
    marginTop: spacing(3)
  }
}))

const schema = Yup.object().shape<Partial<Interface>>({
  name: Yup.string().required(YUP_MSG.REQUIRED).max(20, YUP_MSG.MAX_LENGTH(20)),
  description: Yup.string().max(1000, YUP_MSG.MAX_LENGTH(1000)),
  interface_type: Yup.string()
    .nullable()
    .required(YUP_MSG.REQUIRED)
    .max(20, YUP_MSG.MAX_LENGTH(20))
})

const FORM_STATE_INIT: Interface = {
  id: 0,
  name: '',
  interface_type: 'HTTP',
  url: '',
  method: 'GET',
  description: '',
  repositoryId: 0,
  moduleId: 0,
  status: 200
}

interface Props {
  title?: string
  open: boolean
  onClose: (isOk?: boolean) => void
  itf?: Interface
  repository?: Repository
  mod?: Module
}

function InterfaceForm(props: Props) {
  const auth = useSelector((state: RootState) => state.auth)
  const { open, onClose, itf, title, repository, mod } = props
  const classes = useStyles()
  const dispatch = useDispatch()
  const router = useSelector((state: RootState) => state.router)

  return (
    <Dialog
      open={open}
      onClose={(_event, reason) => reason !== 'backdropClick' && onClose()}
      TransitionComponent={SlideUp}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers={true}>
        <div className={classes.form}>
          <Formik
            initialValues={{
              ...FORM_STATE_INIT,
              ...(itf || {})
            }}
            validationSchema={schema}
            onSubmit={values => {
              const addOrUpdateInterface = values.id
                ? updateInterface
                : addInterface

              if (values.interface_type !== 'HTTP') {
                values.url = ''
                values.status = null
                values.method = ''
              }

              const itf: Interface = {
                ...values,
                creatorId: auth.id,
                repositoryId: repository!.id,
                moduleId: mod!.id
              }
              dispatch(
                addOrUpdateInterface(itf, e => {
                  if (e && e.id) {
                    const href = StoreStateRouterLocationURI(router)
                      .setSearch('itf', e.id)
                      .href()
                    dispatch(push(href))
                  }
                  onClose(true)
                })
              )
            }}
            render={({ isSubmitting, setFieldValue, values }) => {
              return (
                <Form>
                  <div className="rmodal-body">
                    <div className={classes.formItem}>
                      <Field
                        name="name"
                        label="名称"
                        component={TextField}
                        fullWidth={true}
                      />
                    </div>
                    <div className={classes.formItem}>
                      <FormControl>
                        <InputLabel
                          shrink={true}
                          htmlFor="method-label-placeholder"
                        >
                          接口类型
                        </InputLabel>
                        <Select
                          value={
                            // values.interface_type in KNOWN_INTERFACE_TYPE
                            KNOWN_INTERFACE_TYPE.includes(values.interface_type)
                              ? values.interface_type
                              : 'OTHER'
                          }
                          displayEmpty={true}
                          name="interface_type"
                          onChange={selected => {
                            setFieldValue(
                              'interface_type',
                              selected.target.value
                            )
                          }}
                        >
                          {INTERFACE_TYPE.map(interface_type => (
                            <MenuItem
                              key={interface_type}
                              value={interface_type}
                            >
                              {interface_type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                    {!KNOWN_INTERFACE_TYPE.includes(values.interface_type) ? (
                      <div className={classes.formItem}>
                        <Field
                          name="interface_type"
                          label="其他接口类型"
                          component={TextField}
                          fullWidth={true}
                        />
                      </div>
                    ) : null}

                    {values.interface_type === 'HTTP' ? (
                      <div>
                        <div className={classes.formItem}>
                          <Field
                            name="url"
                            label="URL地址"
                            component={TextField}
                            fullWidth={true}
                          />
                        </div>
                        <div className={classes.formItem}>
                          <FormControl>
                            <InputLabel
                              shrink={true}
                              htmlFor="method-label-placeholder"
                            >
                              类型
                            </InputLabel>
                            <Select
                              value={values.method}
                              displayEmpty={true}
                              name="method"
                              onChange={selected => {
                                setFieldValue('method', selected.target.value)
                              }}
                            >
                              {METHODS.map(method => (
                                <MenuItem key={method} value={method}>
                                  {method}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                        <div className={classes.formItem}>
                          <InputLabel
                            shrink={true}
                            htmlFor="method-label-placeholder"
                          >
                            状态码
                          </InputLabel>
                          <Select
                            value={values.status}
                            displayEmpty={true}
                            name="status"
                            onChange={selected => {
                              setFieldValue('status', selected.target.value)
                            }}
                          >
                            {STATUS_LIST.map(status => (
                              <MenuItem key={status} value={status}>
                                {status}
                              </MenuItem>
                            ))}
                          </Select>
                        </div>
                      </div>
                    ) : (

                      <div/>
                    )}

                    <div className={classes.formItem}>
                      <Field
                        name="description"
                        label="说明"
                        component={TextField}
                        multiline={true}
                        fullWidth={true}
                      />
                    </div>
                  </div>
                  <div className={classes.ctl}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      className="mr1"
                      disabled={isSubmitting}
                    >
                      提交
                    </Button>
                    <Button onClick={() => onClose()} disabled={isSubmitting}>
                      取消
                    </Button>
                  </div>
                </Form>
              )
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InterfaceForm
