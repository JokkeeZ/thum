import type { IPage } from "../types";
import SpinnyLoader from "./SpinnyLoader";

function NavigationBarItem(props: {
  current: boolean;
  text: string;
  routeChange: () => void;
}) {
  return (
    <li className="nav-item">
      <a
        href="#"
        className={"nav-link " + (props.current ? "active" : "")}
        onClick={props.routeChange}
      >
        {props.text}
      </a>
    </li>
  );
}

function NavigationBar(props: {
  pages: IPage[]
  routeIndex: number;
  routeChange: (index: number) => void;
}) {
  return (
    <header>
      <nav className="navbar navbar-expand-md bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Thum
          </a>

          <div className="d-flex align-items-center">
            <span className="navbar-text me-3 d-md-none current-temperature">
              <SpinnyLoader width={20} height={20}/>
            </span>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#topnav"
              aria-controls="topnav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className="collapse navbar-collapse" id="topnav">
            <ul className="navbar-nav me-auto">
              {props.pages.map((item, index) => {
                return (
                  <NavigationBarItem
                    current={index == props.routeIndex}
                    text={item.name}
                    key={index}
                    routeChange={() => props.routeChange(index)}
                  />
                );
              })}
            </ul>
          </div>
        </div>

        <div className="d-flex align-items-center">
          <span className="navbar-text me-3 d-none d-md-block current-temperature">
            <SpinnyLoader width={20} height={20}/>
          </span>
        </div>
      </nav>
    </header>
  );
}

export default NavigationBar;
