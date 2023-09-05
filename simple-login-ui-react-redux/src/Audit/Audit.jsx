import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Pagination } from "react-bootstrap";
import { PaginationControl } from "react-bootstrap-pagination-control";

import { userActions } from "_store";

export { Audit };

function Audit() {
  const auth = useSelector((x) => x.auth.value);
  // const users = useSelector(x => x.users.list);
  const usersSlice = useSelector((x) => x.users.totalUsers);
  const dispatch = useDispatch();
  const [totalUsers, setTotalUsers] = useState([]);

  //   const limit = useRef(0);
  //   const page = useRef(1);

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

//   useEffect(() => {
//     console.log("auth", auth);
//     // dispatch(userActions.getAudit(auth));
//     dispatch(
//       userActions.getAudit({ user: auth, page: page, limit: limit })
//     ).unwrap();
//   }, []);

  useEffect(() => {
    console.log("auth", auth);
    // dispatch(userActions.getAudit(auth));
    dispatch(
      userActions.getAudit({ user: auth, page: page, limit: limit })
    ).unwrap();
  }, [page]);

  useEffect(() => {
    console.log("audit", usersSlice?.value?.users);
    if (usersSlice?.value?.users) {
      setTotalUsers(usersSlice.value.users);
    }
    if (usersSlice?.value?.total) {
      setTotal(usersSlice.value.total);
    }
  }, [usersSlice]);

  useEffect(() => {
    console.log(totalUsers);
  }, [totalUsers]);

  return (
    <div>
      <h1>Users History</h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th style={{ width: "30%" }}>First Name</th>
            <th style={{ width: "30%" }}>Last Name</th>
            <th style={{ width: "30%" }}>Username</th>
            <th style={{ width: "30%" }}>Role</th>
            <th style={{ width: "10%" }}> Last Login Time </th>
            <th style={{ width: "10%" }}> Last Login IP </th>
            <th style={{ width: "10%" }}> Last Logout Time </th>
          </tr>
        </thead>
        <tbody>
          {totalUsers?.map((user) => (
            <tr key={user.id}>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>{user?.lastLoginDate ?? "NA"}</td>
              <td>{user?.lastLoginIp ?? "NA"}</td>
              <td>{user?.lastLogoutDate ?? "NA"}</td>
          
            </tr>
          ))}
          {totalUsers?.loading && (
            <tr>
              <td colSpan="4" className="text-center">
                <span className="spinner-border spinner-border-lg align-center"></span>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <PaginationControl
        page={page}
        between={4}
        total={total}
        limit={limit}
        changePage={(page) => {
          setPage(page);
          console.log(page);
        }}
        ellipsis={1}
      />
    </div>
  );
}
