const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  company: state => state.user.company,
  userid: state => state.user.userid,
  name: state => state.user.name,
  roles: state => state.user.roles
}
export default getters
