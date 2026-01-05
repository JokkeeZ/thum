import { NavLink, useNavigate } from "react-router";

export default function NavigationBarItem(props: {
  route: string;
  title: string;
}) {
  const navigation = useNavigate();
  const isCurrentRoute = navigation.name === props.route;

  return (
    <li className="nav-item">
      <NavLink
        to={props.route}
        className={"nav-link " + (isCurrentRoute ? "active" : "")}
      >
        {props.title}
      </NavLink>
    </li>
  );
}
