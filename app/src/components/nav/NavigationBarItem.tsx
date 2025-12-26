import { NavLink, useNavigate } from "react-router";

export default function NavigationBarItem(props: {
  route: string;
  title: string;
}) {
  const navigation = useNavigate();
  return (
    <li className="nav-item">
      <NavLink
        to={props.route}
        className={
          "nav-link " + (navigation.name === props.route ? "active" : "")
        }
      >
        {props.title}
      </NavLink>
    </li>
  );
}
